-- TooHot Online Ordering System - Supabase Schema

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USER PROFILES TABLE
-- =============================================================================
-- Extends Supabase auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- =============================================================================
-- MENU ITEMS TABLE
-- =============================================================================
-- Stores menu items with bilingual support and real-time updates
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_zh TEXT NOT NULL,
    description_en TEXT,
    description_zh TEXT,
    price_cents INTEGER NOT NULL,
    category TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    spice_level INTEGER CHECK (spice_level >= 0 AND spice_level <= 5),
    allergens TEXT[],
    image_url TEXT,
    prep_time_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_items (public read access)
CREATE POLICY "Anyone can view available menu items" 
    ON public.menu_items FOR SELECT 
    USING (is_available = true);

-- Staff can manage menu items (requires service role key)
CREATE POLICY "Service role can manage menu items" 
    ON public.menu_items FOR ALL 
    USING (auth.role() = 'service_role');

-- =============================================================================
-- ORDERS TABLE
-- =============================================================================
-- Stores order information with customer details and payment status
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    order_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled')),
    
    -- Order totals (in cents)
    subtotal_cents INTEGER NOT NULL,
    tax_cents INTEGER NOT NULL,
    total_cents INTEGER NOT NULL,
    
    -- Customer information (denormalized for order history)
    customer_email TEXT NOT NULL,
    customer_first_name TEXT NOT NULL,
    customer_last_name TEXT NOT NULL,
    customer_phone TEXT,
    
    -- Pickup information
    pickup_time TIMESTAMPTZ,
    pickup_notes TEXT,
    
    -- Payment information
    stripe_payment_intent_id TEXT,
    payment_status TEXT DEFAULT 'pending' 
        CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'cancelled')),
    payment_method TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" 
    ON public.orders FOR SELECT 
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can manage all orders" 
    ON public.orders FOR ALL 
    USING (auth.role() = 'service_role');

-- Anonymous users can create orders (for guest checkout)
CREATE POLICY "Anyone can create orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (true);

-- =============================================================================
-- ORDER ITEMS TABLE
-- =============================================================================
-- Stores individual items in each order
CREATE TABLE IF NOT EXISTS public.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    
    -- Menu item information (denormalized for order history)
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
    menu_item_name_en TEXT NOT NULL,
    menu_item_name_zh TEXT NOT NULL,
    menu_item_description_en TEXT,
    menu_item_description_zh TEXT,
    
    -- Order details
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_cents INTEGER NOT NULL,
    total_price_cents INTEGER NOT NULL,
    
    -- Special instructions
    special_instructions TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_items
CREATE POLICY "Users can view own order items" 
    ON public.order_items FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
        )
    );

CREATE POLICY "Service role can manage all order items" 
    ON public.order_items FOR ALL 
    USING (auth.role() = 'service_role');

-- Anyone can create order items (for guest checkout)
CREATE POLICY "Anyone can create order items" 
    ON public.order_items FOR INSERT 
    WITH CHECK (true);

-- =============================================================================
-- ORDER STATUS HISTORY TABLE
-- =============================================================================
-- Tracks order status changes for audit trail
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_status_history
CREATE POLICY "Users can view own order status history" 
    ON public.order_status_history FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_status_history.order_id 
            AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
        )
    );

CREATE POLICY "Service role can manage all order status history" 
    ON public.order_status_history FOR ALL 
    USING (auth.role() = 'service_role');

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at 
    BEFORE UPDATE ON public.menu_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create order status history entry
CREATE OR REPLACE FUNCTION create_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.order_status_history (order_id, status, notes)
        VALUES (NEW.id, NEW.status, 'Status updated to ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for order status changes
CREATE TRIGGER order_status_change_trigger
    AFTER UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION create_order_status_history();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    today_count INTEGER;
    date_str TEXT;
    order_num TEXT;
BEGIN
    -- Get count of orders created today
    SELECT COUNT(*) INTO today_count 
    FROM public.orders 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Format date as YYMMDD
    date_str := TO_CHAR(CURRENT_DATE, 'YYMMDD');
    
    -- Generate order number: TH-YYMMDD-XXX
    order_num := 'TH-' || date_str || '-' || LPAD((today_count + 1)::TEXT, 3, '0');
    
    RETURN order_num;
END;
$$ language 'plpgsql';

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON public.order_items(menu_item_id);

-- Menu items indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available);

-- Order status history indexes
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);

-- =============================================================================
-- REALTIME SUBSCRIPTIONS
-- =============================================================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;

-- =============================================================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================================================

-- Sample test data has been removed. 
-- Use the proper menu data from menu-items-insert.sql instead.

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

-- This schema provides:
-- 1. User authentication with Supabase Auth
-- 2. User profiles linked to auth.users
-- 3. Menu items with real-time updates
-- 4. Orders with customer information
-- 5. Order items with menu item details
-- 6. Order status tracking and history
-- 7. Row Level Security for data protection
-- 8. Real-time subscriptions for live updates
-- 9. Proper indexes for performance
-- 10. Triggers for automatic updates 