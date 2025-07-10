import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase';

// Admin client with service role key
function createAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });
    throw new Error('Missing Supabase environment variables for admin operations');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const { status, notes } = await request.json();
    
  
    
    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }
    
    const supabase = createAdminSupabase();
    
    // First, check if the order exists
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single();
    
    if (checkError) {
      console.error('API: Order not found:', checkError);
      return NextResponse.json(
        { error: `Order not found: ${checkError.message}` },
        { status: 404 }
      );
    }
    
    // Update the order status
    const { data: updatedOrders, error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select('*');
    
    if (updateError) {
      console.error('API: Failed to update order status:', updateError);
      return NextResponse.json(
        { error: `Failed to update order status: ${updateError.message}` },
        { status: 500 }
      );
    }
    
    if (!updatedOrders || updatedOrders.length === 0) {
      return NextResponse.json(
        { error: 'No orders were updated' },
        { status: 500 }
      );
    }
    

    
    // Add status history entry if notes provided
    if (notes) {
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status,
          notes
        });
      
      if (historyError) {
        console.error('API: Failed to add status history note:', historyError);
      }
    }
    
    // Fetch updated order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError) {
      console.error('API: Failed to fetch updated order:', orderError);
      return NextResponse.json(
        { error: `Failed to fetch updated order: ${orderError.message}` },
        { status: 500 }
      );
    }
    
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    
    if (itemsError) {
      console.error('API: Failed to fetch order items:', itemsError);
      return NextResponse.json(
        { error: `Failed to fetch order items: ${itemsError.message}` },
        { status: 500 }
      );
    }
    
    // Convert to our Order type (keep dates as ISO strings for JSON serialization)
    const updatedOrder = {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      subtotalCents: order.subtotal_cents,
      taxCents: order.tax_cents,
      totalCents: order.total_cents,
      customerEmail: order.customer_email,
      customerFirstName: order.customer_first_name,
      customerLastName: order.customer_last_name,
      customerPhone: order.customer_phone || undefined,
      pickupTime: order.pickup_time || undefined,
      pickupNotes: order.pickup_notes || undefined,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method || undefined,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: (orderItems || []).map(item => ({
        menuItemId: item.menu_item_id,
        menuItemNameEn: item.menu_item_name_en,
        menuItemNameZh: item.menu_item_name_zh,
        menuItemDescriptionEn: item.menu_item_description_en || undefined,
        menuItemDescriptionZh: item.menu_item_description_zh || undefined,
        quantity: item.quantity,
        unitPriceCents: item.unit_price_cents,
        totalPriceCents: item.total_price_cents,
        specialInstructions: item.special_instructions || undefined
      }))
    };
    
    return NextResponse.json({ order: updatedOrder });
    
  } catch (error) {
    console.error('API: Error updating order status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 