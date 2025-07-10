import { createClientSupabase, createSupabaseClient } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

// Type definitions
type SupabaseOrder = Database['public']['Tables']['orders']['Row'];
type SupabaseOrderItem = Database['public']['Tables']['order_items']['Row'];

export interface OrderItem {
  menuItemId: string;
  menuItemNameEn: string;
  menuItemNameZh: string;
  menuItemDescriptionEn?: string;
  menuItemDescriptionZh?: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  pickupTime?: Date | string;
  pickupNotes?: string;
  paymentStatus: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  paymentMethod?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  pickupTime?: Date;
  pickupNotes?: string;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
}

// Tax rate (8.25% for example)
const TAX_RATE = 0.0825;

// Helper function to safely parse dates
function safeParseDate(dateString: string | null): Date {
  if (!dateString) {
    return new Date(); // Return current date as fallback
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return new Date(); // Return current date as fallback
    }
    return date;
  } catch (error) {
    console.error('Error parsing date:', error, 'Input:', dateString);
    return new Date(); // Return current date as fallback
  }
}

// Convert Supabase order to our Order type
function convertSupabaseOrder(order: SupabaseOrder, items: SupabaseOrderItem[]): Order {
  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status as Order['status'],
    subtotalCents: order.subtotal_cents,
    taxCents: order.tax_cents,
    totalCents: order.total_cents,
    customerEmail: order.customer_email,
    customerFirstName: order.customer_first_name,
    customerLastName: order.customer_last_name,
    customerPhone: order.customer_phone || undefined,
    pickupTime: order.pickup_time ? safeParseDate(order.pickup_time) : undefined,
    pickupNotes: order.pickup_notes || undefined,
    paymentStatus: order.payment_status as Order['paymentStatus'],
    paymentMethod: order.payment_method || undefined,
    createdAt: safeParseDate(order.created_at),
    updatedAt: safeParseDate(order.updated_at),
    items: items.map(item => ({
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
}

// Create a new order
export async function createOrder(orderData: CreateOrderRequest): Promise<Order> {
  const supabase = createSupabaseClient();
  
  try {
    // Get menu items to calculate prices
    const menuItemIds = orderData.items.map(item => item.menuItemId);
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .in('id', menuItemIds);
    
    if (menuError) {
      throw new Error(`Failed to fetch menu items: ${menuError.message}`);
    }
    
    if (!menuItems || menuItems.length !== menuItemIds.length) {
      throw new Error('One or more menu items not found');
    }
    
    // Calculate totals
    let subtotalCents = 0;
    const orderItems = orderData.items.map(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found`);
      }
      
      const totalPriceCents = menuItem.price_cents * item.quantity;
      subtotalCents += totalPriceCents;
      
      return {
        menuItemId: item.menuItemId,
        menuItemNameEn: menuItem.name_en,
        menuItemNameZh: menuItem.name_zh,
        menuItemDescriptionEn: menuItem.description_en || undefined,
        menuItemDescriptionZh: menuItem.description_zh || undefined,
        quantity: item.quantity,
        unitPriceCents: menuItem.price_cents,
        totalPriceCents,
        specialInstructions: item.specialInstructions
      };
    });
    
    const taxCents = Math.round(subtotalCents * TAX_RATE);
    const totalCents = subtotalCents + taxCents;
    
    // Generate unique order number
    const { data: orderNumber, error: orderNumberError } = await supabase
      .rpc('generate_order_number');
    
    if (orderNumberError) {
      throw new Error(`Failed to generate order number: ${orderNumberError.message}`);
    }
    
    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: null, // For now, support guest checkout
        order_number: orderNumber,
        subtotal_cents: subtotalCents,
        tax_cents: taxCents,
        total_cents: totalCents,
        customer_email: orderData.customerEmail,
        customer_first_name: orderData.customerFirstName,
        customer_last_name: orderData.customerLastName,
        customer_phone: orderData.customerPhone,
        pickup_time: orderData.pickupTime?.toISOString(),
        pickup_notes: orderData.pickupNotes,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();
    
    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }
    
    // Create order items
    const orderItemsData = orderItems.map(item => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      menu_item_name_en: item.menuItemNameEn,
      menu_item_name_zh: item.menuItemNameZh,
      menu_item_description_en: item.menuItemDescriptionEn,
      menu_item_description_zh: item.menuItemDescriptionZh,
      quantity: item.quantity,
      unit_price_cents: item.unitPriceCents,
      total_price_cents: item.totalPriceCents,
      special_instructions: item.specialInstructions
    }));
    
    const { data: createdOrderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData)
      .select();
    
    if (orderItemsError) {
      throw new Error(`Failed to create order items: ${orderItemsError.message}`);
    }
    
    return convertSupabaseOrder(order, createdOrderItems);
    
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Get order by ID
export async function getOrder(orderId: string): Promise<Order | null> {
  const supabase = createSupabaseClient();
  
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return null; // Order not found
      }
      throw new Error(`Failed to fetch order: ${orderError.message}`);
    }
    
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    
    if (itemsError) {
      throw new Error(`Failed to fetch order items: ${itemsError.message}`);
    }
    
    return convertSupabaseOrder(order, orderItems || []);
    
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

// Get order by order number
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const supabase = createSupabaseClient();
  
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();
    
    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return null; // Order not found
      }
      throw new Error(`Failed to fetch order: ${orderError.message}`);
    }
    
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);
    
    if (itemsError) {
      throw new Error(`Failed to fetch order items: ${itemsError.message}`);
    }
    
    return convertSupabaseOrder(order, orderItems || []);
    
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

// Update order status via API route
export async function updateOrderStatus(orderId: string, status: Order['status'], notes?: string): Promise<Order> {
  try {
    const response = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, notes }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update order status');
    }
    
    const { order } = await response.json();
    
    return order;
    
  } catch (error) {
    throw error;
  }
}

// Get orders for a customer (by email)
export async function getCustomerOrders(customerEmail: string): Promise<Order[]> {
  const supabase = createSupabaseClient();
  
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', customerEmail)
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      throw new Error(`Failed to fetch customer orders: ${ordersError.message}`);
    }
    
    if (!orders || orders.length === 0) {
      return [];
    }
    
    // Fetch all order items for these orders
    const orderIds = orders.map(order => order.id);
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);
    
    if (itemsError) {
      throw new Error(`Failed to fetch order items: ${itemsError.message}`);
    }
    
    // Group items by order ID
    const itemsByOrderId = (orderItems || []).reduce((acc, item) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = [];
      }
      acc[item.order_id].push(item);
      return acc;
    }, {} as Record<string, SupabaseOrderItem[]>);
    
    return orders.map(order => convertSupabaseOrder(order, itemsByOrderId[order.id] || []));
    
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    throw error;
  }
}

// Get order status history
export async function getOrderStatusHistory(orderId: string): Promise<Array<{
  id: number;
  status: string;
  notes?: string;
  createdAt: Date;
}>> {
  const supabase = createSupabaseClient();
  
  try {
    const { data: history, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to fetch order status history: ${error.message}`);
    }
    
    return (history || []).map(entry => ({
      id: entry.id,
      status: entry.status,
      notes: entry.notes || undefined,
      createdAt: new Date(entry.created_at)
    }));
    
  } catch (error) {
    console.error('Error fetching order status history:', error);
    throw error;
  }
}

// Real-time order updates subscription
export function subscribeToOrderUpdates(
  orderIds: string[],
  onOrderUpdate: (order: Order) => void,
  onError?: (error: unknown) => void
) {
  const supabase = createClientSupabase();
  
  const subscription = supabase
    .channel('order-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=in.(${orderIds.join(',')})`
      },
      async (payload) => {
        try {
          const updatedOrder = await getOrder(payload.new.id);
          if (updatedOrder) {
            onOrderUpdate(updatedOrder);
          }
        } catch (error) {
          onError?.(error);
        }
      }
    )
    .subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}

// Admin functions (require service role)
export async function getAllOrders(limit: number = 50, offset: number = 0): Promise<Order[]> {
  const supabase = createSupabaseClient();
  
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (ordersError) {
      throw new Error(`Failed to fetch orders: ${ordersError.message}`);
    }
    
    if (!orders || orders.length === 0) {
      return [];
    }
    
    // Fetch all order items for these orders
    const orderIds = orders.map(order => order.id);
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);
    
    if (itemsError) {
      throw new Error(`Failed to fetch order items: ${itemsError.message}`);
    }
    
    // Group items by order ID
    const itemsByOrderId = (orderItems || []).reduce((acc, item) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = [];
      }
      acc[item.order_id].push(item);
      return acc;
    }, {} as Record<string, SupabaseOrderItem[]>);
    
    return orders.map(order => convertSupabaseOrder(order, itemsByOrderId[order.id] || []));
    
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
} 