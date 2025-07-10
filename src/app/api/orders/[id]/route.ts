import { NextRequest, NextResponse } from 'next/server';
import { orderOperations } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order from database
    const order = orderOperations.findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Return order details
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        subtotal_cents: order.subtotal_cents,
        tax_cents: order.tax_cents,
        total_cents: order.total_cents,
        customer_email: order.customer_email,
        customer_first_name: order.customer_first_name,
        customer_last_name: order.customer_last_name,
        customer_phone: order.customer_phone,
        pickup_time: order.pickup_time,
        pickup_notes: order.pickup_notes,
        items: order.items.map(item => ({
          id: item.id,
          menu_item_id: item.menu_item_id,
          menu_item_name_en: item.menu_item_name_en,
          menu_item_name_zh: item.menu_item_name_zh,
          menu_item_description_en: item.menu_item_description_en,
          menu_item_description_zh: item.menu_item_description_zh,
          quantity: item.quantity,
          unit_price_cents: item.unit_price_cents,
          total_price_cents: item.total_price_cents,
          special_instructions: item.special_instructions
        })),
        created_at: order.created_at,
        updated_at: order.updated_at
      }
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch order',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
} 