# TooHot Ordering System - Supabase Integration Guide

## Overview

The TooHot ordering system has been fully integrated with Supabase to provide:

- **PostgreSQL Database**: Robust, scalable database hosting
- **Authentication**: User registration, login, and profile management
- **Real-time Updates**: Live menu updates across all clients
- **Row Level Security**: Built-in data protection and access control
- **API Generation**: Auto-generated REST APIs with type safety

## Architecture

### Database Structure

The system uses the following PostgreSQL tables:

1. **`profiles`** - User profiles linked to Supabase Auth
2. **`menu_items`** - Restaurant menu with bilingual support
3. **`orders`** - Customer orders with payment tracking
4. **`order_items`** - Individual items per order
5. **`order_status_history`** - Order status audit trail

### Authentication Flow

- **Guest Users**: Can browse menu and place orders without account
- **Registered Users**: Can track order history and manage profile
- **Admin Users**: Can manage menu items using service role key

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization and set project details
4. Wait for project to be provisioned

### 2. Configure Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `database/supabase-schema.sql`
3. Run the SQL to create all tables, functions, and policies
4. Verify tables are created in the Table Editor

### 3. Get API Keys

1. Go to Settings > API in your Supabase dashboard
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Public Key**: For client-side operations
   - **Service Role Key**: For admin operations (keep secret!)

### 4. Update Environment Variables

Create or update your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_URL=https://your-project-id.supabase.co

# Stripe Configuration (keep existing)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 5. Authentication Setup

Enable email authentication:

1. Go to Authentication > Settings in Supabase dashboard
2. Configure Site URL: `http://localhost:3001` (for development)
3. Add redirect URLs if needed
4. Configure email templates (optional)

## Key Features

### 1. Real-time Menu Updates

The menu automatically updates across all connected clients when items are added, modified, or removed:

```typescript
// Menu items subscribe to real-time changes
const unsubscribe = subscribeToMenuItems(
  (items: MenuItem[]) => {
    setMenuData(items);
    // Menu UI updates automatically
  }
);
```

### 2. User Authentication

Users can create accounts and manage their profiles:

- **Sign Up**: Email/password registration with profile creation
- **Sign In**: Email/password authentication
- **Profile Management**: Update name, phone, preferences
- **Order History**: View past orders and status

### 3. Guest Checkout

Non-registered users can still place orders:

- Orders are created without `user_id`
- Customer information is stored in order record
- Email confirmation still sent

### 4. Row Level Security (RLS)

Data is automatically protected by RLS policies:

- **Profiles**: Users can only view/edit own profile
- **Orders**: Users can only see their own orders
- **Menu Items**: Public read access, admin write access
- **Service Role**: Bypasses RLS for admin operations

## Usage Guide

### For Customers

1. **Browse Menu**: All menu items load from Supabase with real-time updates
2. **Create Account** (optional): Go to `/account` to register
3. **Place Orders**: Works with or without account
4. **Track Orders**: Registered users can view order history

### For Restaurant Staff

#### Managing Menu Items

Use the admin functions in `src/lib/menu-api.ts`:

```typescript
// Add new menu item
const newItem = await createMenuItem({
  name_en: "Spicy Kung Pao Chicken",
  name_zh: "辣宫保鸡丁",
  price_cents: 1899,
  category: "chicken",
  is_available: true,
  // ... other fields
});

// Update availability
await toggleMenuItemAvailability(itemId, false); // Sold out

// Update item details
await updateMenuItem(itemId, {
  price_cents: 1999, // Price increase
  spice_level: 4     // Spicier version
});
```

#### Order Management

Orders flow through these statuses:
- `pending` → `paid` → `preparing` → `ready` → `completed`

Update order status in Supabase dashboard or via API:

```typescript
const { error } = await supabase
  .from('orders')
  .update({ status: 'preparing' })
  .eq('id', orderId);
```

## Real-time Features

### Menu Updates

When menu items change in the database:

1. **Trigger**: Database change (INSERT/UPDATE/DELETE)
2. **Broadcast**: Supabase real-time sends notification
3. **Update**: All connected clients reload menu automatically
4. **UI Refresh**: Menu components re-render with new data

### Order Status Updates

Restaurant staff can update order status, and customers see updates in real-time on their order confirmation page.

## Security Features

### Row Level Security Policies

**Profiles Table**:
```sql
-- Users can only access their own profile
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);
```

**Orders Table**:
```sql
-- Users can see their own orders or guest orders
CREATE POLICY "Users can view own orders" 
    ON orders FOR SELECT 
    USING (auth.uid() = user_id OR user_id IS NULL);
```

**Menu Items Table**:
```sql
-- Anyone can view available items
CREATE POLICY "Anyone can view available menu items" 
    ON menu_items FOR SELECT 
    USING (is_available = true);
```

### API Security

- **Public API**: Uses anon key for public operations
- **Admin API**: Uses service role key for privileged operations
- **User Context**: Auth state automatically passed to API routes

## Performance Optimizations

### Database Indexes

The schema includes performance indexes:

```sql
-- Orders performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Menu items performance
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
```

### Real-time Subscription Management

- Subscriptions automatically clean up on component unmount
- Efficient filtering reduces unnecessary updates
- Batch updates when multiple changes occur

## Migration from SQLite

The integration replaces the previous SQLite implementation:

### What Changed

1. **Database**: SQLite → PostgreSQL (Supabase)
2. **API Routes**: Direct database calls → Supabase client
3. **Authentication**: Custom → Supabase Auth
4. **Real-time**: None → Supabase Real-time
5. **Security**: Manual → Row Level Security

### Data Migration

If you have existing SQLite data, you can migrate it:

1. Export data from SQLite using the old database functions
2. Transform data to match Supabase schema
3. Import using Supabase client or SQL inserts
4. Verify data integrity and relationships

## Troubleshooting

### Common Issues

**1. Environment Variables Not Working**
- Ensure `.env.local` is in project root
- Restart development server after changes
- Check for typos in variable names

**2. RLS Policies Blocking Access**
- Verify user is authenticated for protected operations
- Use service role key for admin operations
- Check policy conditions match your use case

**3. Real-time Not Working**
- Confirm table is added to `supabase_realtime` publication
- Check browser console for subscription errors
- Verify Supabase URL and anon key are correct

**4. Authentication Issues**
- Check Site URL in Supabase Auth settings
- Verify email confirmation if required
- Ensure redirect URLs are properly configured

### Debug Mode

Enable debug logging by setting:

```bash
# Add to .env.local for development
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

## Production Considerations

### Security Checklist

- [ ] Service role key is properly secured
- [ ] RLS policies are tested and working
- [ ] Site URL configured for production domain
- [ ] Email templates customized
- [ ] Rate limiting configured if needed

### Performance Monitoring

Monitor key metrics in Supabase dashboard:

- Database CPU/Memory usage
- API request volume and latency
- Real-time connection count
- Authentication success rates

### Backup Strategy

Supabase provides automatic backups, but consider:

- Point-in-time recovery requirements
- Data export procedures
- Disaster recovery testing

## API Reference

### Client Functions

```typescript
// Authentication
const { user, profile, loading } = useAuth();
await signUp(email, password, userData);
await signIn(email, password);
await signOut();
await updateProfile(updates);

// Menu Management
const menuItems = await loadMenuItems();
const unsubscribe = subscribeToMenuItems(onUpdate, onError);
await createMenuItem(itemData);
await updateMenuItem(id, updates);
await toggleMenuItemAvailability(id, isAvailable);

// Supabase Clients
const client = createClientSupabase();      // Browser client
const server = createSupabaseClient();      // Server client
const admin = createAdminSupabase();        // Admin client
```

### Database Schema Types

The system includes full TypeScript types for all database tables in `src/lib/supabase.ts`. These types ensure type safety across the application and provide excellent IDE support.

## Support

For issues related to:

- **Supabase Setup**: Check [Supabase Documentation](https://supabase.com/docs)
- **Integration Code**: Review this documentation and source code
- **Database Schema**: See `database/supabase-schema.sql`
- **API Usage**: Check `src/lib/` files for examples

The Supabase integration provides a robust, scalable foundation for the TooHot ordering system with real-time capabilities and enterprise-grade security. 