import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

// Database types
export interface Customer {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  customer_id?: number;
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
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
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
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// Database connection
let db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'database', 'orders.db');
    
    try {
      db = new Database(dbPath);
      db.pragma('journal_mode = WAL');
      
      // Initialize database with schema
      initializeDatabase(db);
      
      console.log(`Connected to SQLite database at ${dbPath}`);
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }
  
  return db;
}

function initializeDatabase(database: Database.Database) {
  try {
    const schemaPath = join(process.cwd(), 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Execute schema (split by semicolon and execute each statement)
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      database.exec(statement);
    }
    
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}

// Customer operations
export const customerOperations = {
  create: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Customer => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO customers (email, first_name, last_name, phone)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      customer.email,
      customer.first_name,
      customer.last_name,
      customer.phone
    );
    
    return {
      id: result.lastInsertRowid as number,
      ...customer
    };
  },

  findByEmail: (email: string): Customer | null => {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM customers WHERE email = ?');
    return stmt.get(email) as Customer | null;
  },

  findById: (id: number): Customer | null => {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM customers WHERE id = ?');
    return stmt.get(id) as Customer | null;
  }
};

// Order operations
export const orderOperations = {
  create: (order: Omit<Order, 'created_at' | 'updated_at'>): Order => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO orders (
        id, customer_id, order_number, status, subtotal_cents, tax_cents, total_cents,
        customer_email, customer_first_name, customer_last_name, customer_phone,
        pickup_time, pickup_notes, stripe_payment_intent_id, payment_status, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      order.id,
      order.customer_id,
      order.order_number,
      order.status,
      order.subtotal_cents,
      order.tax_cents,
      order.total_cents,
      order.customer_email,
      order.customer_first_name,
      order.customer_last_name,
      order.customer_phone,
      order.pickup_time,
      order.pickup_notes,
      order.stripe_payment_intent_id,
      order.payment_status,
      order.payment_method
    );
    
    return order;
  },

  findById: (id: string): OrderWithItems | null => {
    const db = getDatabase();
    
    // Get order
    const orderStmt = db.prepare('SELECT * FROM orders WHERE id = ?');
    const order = orderStmt.get(id) as Order | null;
    
    if (!order) return null;
    
    // Get order items
    const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id');
    const items = itemsStmt.all(id) as OrderItem[];
    
    return {
      ...order,
      items
    };
  },

  findByOrderNumber: (orderNumber: string): OrderWithItems | null => {
    const db = getDatabase();
    
    const orderStmt = db.prepare('SELECT * FROM orders WHERE order_number = ?');
    const order = orderStmt.get(orderNumber) as Order | null;
    
    if (!order) return null;
    
    const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id');
    const items = itemsStmt.all(order.id) as OrderItem[];
    
    return {
      ...order,
      items
    };
  },

  updateStatus: (id: string, status: Order['status']): boolean => {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
    const result = stmt.run(status, id);
    return result.changes > 0;
  },

  updatePaymentStatus: (id: string, paymentStatus: Order['payment_status'], stripePaymentIntentId?: string): boolean => {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE orders 
      SET payment_status = ?, stripe_payment_intent_id = COALESCE(?, stripe_payment_intent_id)
      WHERE id = ?
    `);
    const result = stmt.run(paymentStatus, stripePaymentIntentId, id);
    return result.changes > 0;
  },

  generateOrderNumber: (): string => {
    const db = getDatabase();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE("now")');
    const result = stmt.get() as { count: number };
    
    const today = new Date();
    const dateStr = today.getFullYear().toString().slice(-2) + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getDate().toString().padStart(2, '0');
    
    const orderNumber = `TH-${dateStr}-${(result.count + 1).toString().padStart(3, '0')}`;
    return orderNumber;
  }
};

// Order item operations
export const orderItemOperations = {
  create: (orderItem: Omit<OrderItem, 'id' | 'created_at'>): OrderItem => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO order_items (
        order_id, menu_item_id, menu_item_name_en, menu_item_name_zh,
        menu_item_description_en, menu_item_description_zh, quantity,
        unit_price_cents, total_price_cents, special_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      orderItem.order_id,
      orderItem.menu_item_id,
      orderItem.menu_item_name_en,
      orderItem.menu_item_name_zh,
      orderItem.menu_item_description_en,
      orderItem.menu_item_description_zh,
      orderItem.quantity,
      orderItem.unit_price_cents,
      orderItem.total_price_cents,
      orderItem.special_instructions
    );
    
    return {
      id: result.lastInsertRowid as number,
      ...orderItem
    };
  },

  findByOrderId: (orderId: string): OrderItem[] => {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id');
    return stmt.all(orderId) as OrderItem[];
  }
};

// Utility functions
export const dbUtils = {
  close: () => {
    if (db) {
      db.close();
      db = null;
    }
  },

  backup: (backupPath: string) => {
    const database = getDatabase();
    return database.backup(backupPath);
  },

  // Transaction wrapper
  transaction: <T>(fn: (db: Database.Database) => T): T => {
    const database = getDatabase();
    const transaction = database.transaction(fn);
    return transaction(database);
  }
};

// Export database instance getter for direct queries if needed
export { getDatabase }; 