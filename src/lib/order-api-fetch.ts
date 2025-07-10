import { Order } from '@/lib/order-api';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper function to safely parse dates
function safeParseDate(dateString: string | null): Date {
  if (!dateString) {
    return new Date(); // Return current date as fallback
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date(); // Return current date as fallback
    }
    return date;
  } catch {
    return new Date(); // Return current date as fallback
  }
}

// Convert raw database data to our Order type
function convertToOrder(orderData: {
  id: string;
  order_number: string;
  status: string;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone?: string;
  pickup_time?: string;
  pickup_notes?: string;
  payment_status: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}, orderItems: Array<{
  menu_item_id: string;
  menu_item_name_en: string;
  menu_item_name_zh: string;
  menu_item_description_en?: string;
  menu_item_description_zh?: string;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
  special_instructions?: string;
}>): Order {
  return {
    id: orderData.id,
    orderNumber: orderData.order_number,
    status: orderData.status as Order['status'],
    subtotalCents: orderData.subtotal_cents,
    taxCents: orderData.tax_cents,
    totalCents: orderData.total_cents,
    customerEmail: orderData.customer_email,
    customerFirstName: orderData.customer_first_name,
    customerLastName: orderData.customer_last_name,
    customerPhone: orderData.customer_phone || undefined,
    pickupTime: orderData.pickup_time ? safeParseDate(orderData.pickup_time) : undefined,
    pickupNotes: orderData.pickup_notes || undefined,
    paymentStatus: orderData.payment_status as Order['paymentStatus'],
    paymentMethod: orderData.payment_method || undefined,
    createdAt: safeParseDate(orderData.created_at),
    updatedAt: safeParseDate(orderData.updated_at),
    items: orderItems.map(item => ({
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

// Get all orders with fetch (bypasses Supabase client)
export async function getAllOrdersWithFetch(limit: number = 50, offset: number = 0): Promise<Order[]> {
  try {
    // Fetch orders
    const ordersResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!ordersResponse.ok) {
      return [];
    }
    
    const orders = await ordersResponse.json();
    
    if (!orders || orders.length === 0) {
      return [];
    }
    
    // Get order IDs for fetching items
    const orderIds = orders.map((order: {id: string}) => order.id);
    
    // Fetch order items for all orders
    const itemsResponse = await fetch(`${SUPABASE_URL}/rest/v1/order_items?select=*&order_id=in.(${orderIds.join(',')})`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!itemsResponse.ok) {
      return [];
    }
    
    const allOrderItems = await itemsResponse.json();
    
    // Group items by order ID
    const itemsByOrderId: Record<string, Array<{
      order_id: string;
      menu_item_id: string;
      menu_item_name_en: string;
      menu_item_name_zh: string;
      menu_item_description_en?: string;
      menu_item_description_zh?: string;
      quantity: number;
      unit_price_cents: number;
      total_price_cents: number;
      special_instructions?: string;
    }>> = {};
    allOrderItems.forEach((item: {order_id: string; menu_item_id: string; menu_item_name_en: string; menu_item_name_zh: string; menu_item_description_en?: string; menu_item_description_zh?: string; quantity: number; unit_price_cents: number; total_price_cents: number; special_instructions?: string}) => {
      if (!itemsByOrderId[item.order_id]) {
        itemsByOrderId[item.order_id] = [];
      }
      itemsByOrderId[item.order_id].push(item);
    });
    
    // Convert to Order objects
    return orders.map((order: {
      id: string;
      order_number: string;
      status: string;
      subtotal_cents: number;
      tax_cents: number;
      total_cents: number;
      customer_email: string;
      customer_first_name: string;
      customer_last_name: string;
      customer_phone?: string;
      pickup_time?: string;
      pickup_notes?: string;
      payment_status: string;
      payment_method?: string;
      created_at: string;
      updated_at: string;
    }) => convertToOrder(order, itemsByOrderId[order.id] || []));
    
  } catch {
    return [];
  }
}

// Get single order with fetch
export async function getOrderWithFetch(orderId: string): Promise<Order | null> {
  try {
    // Fetch order
    const orderResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&id=eq.${orderId}`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!orderResponse.ok) {
      return null;
    }
    
    const orders = await orderResponse.json();
    
    if (!orders || orders.length === 0) {
      return null;
    }
    
    const order = orders[0];
    
    // Fetch order items
    const itemsResponse = await fetch(`${SUPABASE_URL}/rest/v1/order_items?select=*&order_id=eq.${orderId}`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!itemsResponse.ok) {
      return null;
    }
    
    const orderItems = await itemsResponse.json();
    
    return convertToOrder(order, orderItems || []);
    
  } catch {
    return null;
  }
}

// Test database connection for orders
export async function testOrderDatabaseConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=count&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.ok;
    
  } catch {
    return false;
  }
} 