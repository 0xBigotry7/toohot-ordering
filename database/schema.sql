-- TooHot Online Ordering Database Schema

-- Customers table to store customer information
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders table to store order information
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, -- UUID format
    customer_id INTEGER,
    order_number TEXT UNIQUE NOT NULL, -- Human-readable order number (e.g., TH-001)
    status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, preparing, ready, completed, cancelled
    
    -- Order details
    subtotal_cents INTEGER NOT NULL, -- Subtotal in cents
    tax_cents INTEGER NOT NULL,      -- Tax amount in cents
    total_cents INTEGER NOT NULL,    -- Total amount in cents
    
    -- Customer information (denormalized for order history)
    customer_email TEXT NOT NULL,
    customer_first_name TEXT NOT NULL,
    customer_last_name TEXT NOT NULL,
    customer_phone TEXT,
    
    -- Pickup information
    pickup_time DATETIME,
    pickup_notes TEXT,
    
    -- Payment information
    stripe_payment_intent_id TEXT,
    payment_status TEXT DEFAULT 'pending', -- pending, succeeded, failed, cancelled
    payment_method TEXT, -- card, cash, etc.
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order items table to store individual items in each order
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    
    -- Menu item information (denormalized for order history)
    menu_item_id TEXT NOT NULL,
    menu_item_name_en TEXT NOT NULL,
    menu_item_name_zh TEXT NOT NULL,
    menu_item_description_en TEXT,
    menu_item_description_zh TEXT,
    
    -- Order details
    quantity INTEGER NOT NULL,
    unit_price_cents INTEGER NOT NULL, -- Price per item in cents
    total_price_cents INTEGER NOT NULL, -- quantity * unit_price_cents
    
    -- Special instructions
    special_instructions TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Order status history for tracking
CREATE TABLE IF NOT EXISTS order_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);

-- Create triggers for updating timestamps
CREATE TRIGGER IF NOT EXISTS update_customers_timestamp 
AFTER UPDATE ON customers
BEGIN
    UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_orders_timestamp 
AFTER UPDATE ON orders
BEGIN
    UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Create trigger for order status history
CREATE TRIGGER IF NOT EXISTS order_status_history_trigger
AFTER UPDATE OF status ON orders
WHEN OLD.status != NEW.status
BEGIN
    INSERT INTO order_status_history (order_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Status updated');
END; 