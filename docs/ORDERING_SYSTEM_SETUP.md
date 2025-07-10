# TooHot Online Ordering System Setup Guide

## 🚀 **System Overview**

The TooHot Online Ordering System is a complete e-commerce solution built with Next.js, featuring:

- **Frontend**: React-based menu browsing and cart management
- **Backend**: Next.js API routes for order processing
- **Database**: SQLite for order storage
- **Payment**: Stripe integration for secure transactions
- **Multilingual**: English and Chinese support

## 📋 **Prerequisites**

- Node.js 18+ installed
- npm or yarn package manager
- Stripe account for payment processing

## 🔧 **Setup Instructions**

### 1. Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your actual values:
   ```bash
   # Required: Get from https://dashboard.stripe.com/apikeys
   STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key
   
   # Optional: Database path (default: ./database/orders.db)
   DATABASE_PATH=./database/orders.db
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Database

The database will be automatically created when you first run the application. The system uses SQLite with the following tables:

- `customers` - Customer information
- `orders` - Order details and status
- `order_items` - Individual menu items in orders
- `order_status_history` - Order status tracking

### 4. Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## 🧪 **Testing the System**

### Complete Order Flow Test

1. **Browse Menu**
   - Navigate to `http://localhost:3001`
   - Browse menu items by category
   - Use search and filters
   - Add items to cart (click "Add to Cart")

2. **Review Cart**
   - Click the cart icon in the header
   - Review items and quantities
   - Adjust quantities or remove items
   - Note the subtotal, tax, and total calculations

3. **Checkout Process**
   - Click "Proceed to Checkout"
   - Fill out customer information:
     - First Name: John
     - Last Name: Doe
     - Email: john.doe@example.com
     - Phone: (555) 123-4567
   - Select pickup time (optional)
   - Add special instructions (optional)
   - Click "Continue to Payment"

4. **Payment Testing**
   Use these Stripe test cards:
   
   **Successful Payment:**
   - Card: 4242 4242 4242 4242
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

   **Declined Payment:**
   - Card: 4000 0000 0000 0002
   - Other fields: Same as above

   **Requires Authentication:**
   - Card: 4000 0025 0000 3155
   - Other fields: Same as above

5. **Order Confirmation**
   - After successful payment, you'll be redirected to the order confirmation page
   - Note the order number and status
   - Review order details and items

### API Testing

You can also test the API endpoints directly:

```bash
# Create an order
curl -X POST http://localhost:3001/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "(555) 123-4567"
    },
    "cartItems": [
      {
        "menuItem": {
          "id": "1",
          "name": {"en": "Kung Pao Chicken", "zh": "宫保鸡丁"},
          "description": {"en": "Spicy chicken with peanuts", "zh": "辣子鸡丁配花生"},
          "price": "$18.99",
          "category": "chicken"
        },
        "quantity": 2,
        "unitPrice": 1899,
        "totalPrice": 3798
      }
    ]
  }'

# Get order details (replace ORDER_ID with actual ID)
curl http://localhost:3001/api/orders/ORDER_ID
```

## 🗂️ **Database Management**

### View Database Contents

You can use any SQLite browser tool to view the database:

1. **SQLite Browser** (GUI): Download from https://sqlitebrowser.org/
2. **Command Line**:
   ```bash
   sqlite3 database/orders.db
   .tables
   SELECT * FROM orders;
   ```

### Database Schema

The main tables are:

- **customers**: Customer information
- **orders**: Order details with status and payment info
- **order_items**: Individual menu items per order
- **order_status_history**: Status change tracking

## 🔍 **Troubleshooting**

### Common Issues

1. **Database Error**: Ensure the `database/` directory exists and is writable
2. **Stripe Error**: Verify your Stripe keys are correct and active
3. **Port Conflict**: If port 3001 is in use, modify `package.json` or use a different port

### Error Logs

Check the console for detailed error messages:
- Frontend errors: Browser console
- Backend errors: Terminal running `npm run dev`

### Test Data

The system includes real menu data from `public/menu.json`. You can modify this file to test with different menu items.

## 📊 **Order Status Flow**

Orders follow this status progression:

1. **pending** - Order created, awaiting payment
2. **paid** - Payment confirmed
3. **preparing** - Kitchen is preparing the order
4. **ready** - Order ready for pickup
5. **completed** - Order picked up
6. **cancelled** - Order cancelled

## 🔐 **Security Notes**

- Never commit `.env.local` to version control
- Use Stripe test keys for development
- Switch to Stripe live keys only for production
- Database file should be excluded from public access

## 🌐 **Multilingual Support**

The system supports English and Chinese:
- Frontend UI elements are translated
- Menu items support both languages
- Order confirmations display in selected language
- Toggle language using the button in the header

## 📱 **Mobile Compatibility**

The interface is responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🎯 **Next Steps**

For production deployment:

1. Set up production Stripe keys
2. Configure production database (PostgreSQL recommended)
3. Set up email notifications
4. Add order management dashboard
5. Implement inventory tracking
6. Add customer accounts and order history

## 🆘 **Support**

For technical issues:
- Check the console for error messages
- Verify environment variables are set correctly
- Ensure all dependencies are installed
- Test with Stripe's test cards first

## 📈 **Performance Optimization**

For better performance:
- Use a production database like PostgreSQL
- Implement Redis for caching
- Add image optimization for menu items
- Set up monitoring and logging 