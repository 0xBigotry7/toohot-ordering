import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createAdminSupabase, createSupabaseClient } from '@/lib/supabase';
import { calculateTotal } from '@/lib/stripe';
import { CartItem } from '@/types';

interface CreateOrderRequest {
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  cartItems: CartItem[];
  pickupTime?: string;
  pickupNotes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderRequest = await req.json();
    
    // Validate request
    if (!body.customer || !body.cartItems || body.cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Customer information and cart items are required' },
        { status: 400 }
      );
    }

    // Validate customer data
    const { customer, cartItems, pickupTime, pickupNotes } = body;
    if (!customer.email || !customer.firstName || !customer.lastName) {
      return NextResponse.json(
        { error: 'Customer email, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Validate cart items
    for (const item of cartItems) {
      if (!item.menuItem || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Invalid cart items' },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const subtotalCents = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const { tax: taxCents, total: totalCents } = calculateTotal(subtotalCents);

    // Use admin client for database operations
    const supabase = createAdminSupabase();
    
    // Get user from session if available
    const userSupabase = createSupabaseClient();
    const { data: { user } } = await userSupabase.auth.getUser();
    
    // Generate order ID and number
    const orderId = uuidv4();
    
    // Generate order number using Supabase function
    const { data: orderNumberData, error: orderNumberError } = await supabase
      .rpc('generate_order_number');
    
    if (orderNumberError) {
      console.error('Error generating order number:', orderNumberError);
      return NextResponse.json(
        { error: 'Failed to generate order number' },
        { status: 500 }
      );
    }

    // Create order
    const orderData = {
      id: orderId,
      user_id: user?.id || null, // Link to user if authenticated
      order_number: orderNumberData,
      status: 'pending' as const,
      subtotal_cents: subtotalCents,
      tax_cents: taxCents,
      total_cents: totalCents,
      customer_email: customer.email,
      customer_first_name: customer.firstName,
      customer_last_name: customer.lastName,
      customer_phone: customer.phone,
      pickup_time: pickupTime,
      pickup_notes: pickupNotes,
      payment_status: 'pending' as const
    };

    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItemsData = cartItems.map(cartItem => ({
      order_id: orderId,
      menu_item_id: cartItem.menuItem.id,
      menu_item_name_en: cartItem.menuItem.name.en,
      menu_item_name_zh: cartItem.menuItem.name.zh,
      menu_item_description_en: cartItem.menuItem.description?.en,
      menu_item_description_zh: cartItem.menuItem.description?.zh,
      quantity: cartItem.quantity,
      unit_price_cents: cartItem.unitPrice,
      total_price_cents: cartItem.totalPrice,
      special_instructions: null // TODO: Add this to cart items if needed
    }));

    const { data: createdOrderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData)
      .select();

    if (orderItemsError) {
      console.error('Error creating order items:', orderItemsError);
      
      // Clean up the order if order items creation failed
      await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      order: {
        id: createdOrder.id,
        orderNumber: createdOrder.order_number,
        status: createdOrder.status,
        subtotalCents: createdOrder.subtotal_cents,
        taxCents: createdOrder.tax_cents,
        totalCents: createdOrder.total_cents,
        customer: {
          email: createdOrder.customer_email,
          firstName: createdOrder.customer_first_name,
          lastName: createdOrder.customer_last_name,
          phone: createdOrder.customer_phone
        },
        pickupTime: createdOrder.pickup_time,
        pickupNotes: createdOrder.pickup_notes,
        paymentStatus: createdOrder.payment_status,
        items: createdOrderItems?.map(item => ({
          id: item.id,
          menuItemId: item.menu_item_id,
          name: {
            en: item.menu_item_name_en,
            zh: item.menu_item_name_zh
          },
          description: {
            en: item.menu_item_description_en,
            zh: item.menu_item_description_zh
          },
          quantity: item.quantity,
          unitPriceCents: item.unit_price_cents,
          totalPriceCents: item.total_price_cents,
          specialInstructions: item.special_instructions
        })) || [],
        createdAt: createdOrder.created_at
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
} 