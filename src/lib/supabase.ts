import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Database types - we'll define these based on our schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id?: string;
          order_number: string;
          status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          subtotal_cents: number;
          tax_cents: number;
          total_cents: number;
          customer_email: string;
          customer_first_name: string;
          customer_last_name: string;
          customer_phone?: string;
          pickup_time?: string;
          pickup_notes?: string;
          stripe_payment_intent_id?: string;
          payment_status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
          payment_method?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id?: string;
          order_number: string;
          status?: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          subtotal_cents: number;
          tax_cents: number;
          total_cents: number;
          customer_email: string;
          customer_first_name: string;
          customer_last_name: string;
          customer_phone?: string;
          pickup_time?: string;
          pickup_notes?: string;
          stripe_payment_intent_id?: string;
          payment_status?: 'pending' | 'succeeded' | 'failed' | 'cancelled';
          payment_method?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_number?: string;
          status?: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          subtotal_cents?: number;
          tax_cents?: number;
          total_cents?: number;
          customer_email?: string;
          customer_first_name?: string;
          customer_last_name?: string;
          customer_phone?: string;
          pickup_time?: string;
          pickup_notes?: string;
          stripe_payment_intent_id?: string;
          payment_status?: 'pending' | 'succeeded' | 'failed' | 'cancelled';
          payment_method?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: number;
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
          created_at: string;
        };
        Insert: {
          id?: number;
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
          created_at?: string;
        };
        Update: {
          id?: number;
          order_id?: string;
          menu_item_id?: string;
          menu_item_name_en?: string;
          menu_item_name_zh?: string;
          menu_item_description_en?: string;
          menu_item_description_zh?: string;
          quantity?: number;
          unit_price_cents?: number;
          total_price_cents?: number;
          special_instructions?: string;
          created_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          name_en: string;
          name_zh: string;
          description_en?: string;
          description_zh?: string;
          price_cents: number;
          category: string;
          is_available: boolean;
          is_popular?: boolean;
          is_vegetarian?: boolean;
          is_vegan?: boolean;
          spice_level?: number;
          allergens?: string[];
          image_url?: string;
          prep_time_minutes?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name_en: string;
          name_zh: string;
          description_en?: string;
          description_zh?: string;
          price_cents: number;
          category: string;
          is_available?: boolean;
          is_popular?: boolean;
          is_vegetarian?: boolean;
          is_vegan?: boolean;
          spice_level?: number;
          allergens?: string[];
          image_url?: string;
          prep_time_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_zh?: string;
          description_en?: string;
          description_zh?: string;
          price_cents?: number;
          category?: string;
          is_available?: boolean;
          is_popular?: boolean;
          is_vegetarian?: boolean;
          is_vegan?: boolean;
          spice_level?: number;
          allergens?: string[];
          image_url?: string;
          prep_time_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_status_history: {
        Row: {
          id: number;
          order_id: string;
          status: string;
          notes?: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          order_id: string;
          status: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          order_id?: string;
          status?: string;
          notes?: string;
          created_at?: string;
        };
      };
    };
  };
}

// Singleton browser client instance
let browserClientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Client-side Supabase client (for use in browser components)
export function createClientSupabase() {
  if (!browserClientInstance) {
    browserClientInstance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserClientInstance;
}

// Simplified server client for API routes
export function createSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Admin client for bypassing RLS (use carefully in API routes)
export function createAdminSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables for admin client');
  }
  
  return createClient<Database>(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
} 