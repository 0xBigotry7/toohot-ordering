# Google Analytics 4 (GA4) Setup Guide for TooHot Ordering

## 📊 Overview

This guide shows you how to implement Google Analytics 4 tracking for your ordering website to track:

- **E-commerce funnel**: Menu views → Add to cart → Checkout → Purchase
- **User behavior**: Search, filtering, language preferences
- **Business metrics**: Revenue, popular items, conversion rates
- **Technical performance**: Errors, page load times

## 🚀 Quick Setup

### 1. Get Your GA4 Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property for your restaurant
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)

### 2. Add Environment Variable

Add to your `.env.local` file:

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Update Your Layout

```tsx
// src/app/layout.tsx
import { AnalyticsProvider } from '@/components/Analytics';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AnalyticsProvider>
            <CartProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </CartProvider>
          </AnalyticsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 4. Add Analytics to Your Main Page

```tsx
// src/app/page.tsx
import { PageAnalytics, AnalyticsNotice, useAnalyticsConsent } from '@/components/Analytics';
import { useMenuTracking, useOrderTracking } from '@/hooks/useAnalytics';

export default function Home() {
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  
  // Analytics hooks
  const menuTracking = useMenuTracking();
  const orderTracking = useOrderTracking();
  const { getConsent, setConsent } = useAnalyticsConsent();
  
  // Analytics consent state
  const [showAnalyticsNotice, setShowAnalyticsNotice] = useState(false);

  // Check analytics consent on load
  useEffect(() => {
    const consent = getConsent();
    if (consent === null) {
      setShowAnalyticsNotice(true);
    }
  }, []);

  // Track add to cart
  const handleAddToCart = (item: MenuItem) => {
    addItem(item, 1);
    
    // Track in analytics
    orderTracking.trackCartAddition({
      id: item.id,
      name: item.name[language],
      category: item.category,
      price: parseFloat(item.price.replace('$', '')) * 100,
      quantity: 1,
      language
    });
  };

  return (
    <div>
      <PageAnalytics />
      
      {/* Your existing JSX */}
      
      {/* Analytics consent notice */}
      <AnalyticsNotice
        language={language}
        isVisible={showAnalyticsNotice}
        onAccept={() => {
          setConsent(true);
          setShowAnalyticsNotice(false);
        }}
        onDecline={() => {
          setConsent(false);
          setShowAnalyticsNotice(false);
        }}
      />
    </div>
  );
}
```

## 📈 Key Events Being Tracked

### E-commerce Events

| Event | When it fires | Data tracked |
|-------|---------------|---------------|
| `view_item` | User clicks on menu item | Item details, price, category |
| `add_to_cart` | User adds item to cart | Item details, quantity, total value |
| `remove_from_cart` | User removes item from cart | Item details, quantity |
| `view_cart` | User opens cart | All cart items, total value |
| `begin_checkout` | User starts checkout | Cart contents, total value |
| `purchase` | Order completed successfully | Order ID, total, all items |

### Custom Events

| Event | When it fires | Data tracked |
|-------|---------------|---------------|
| `search` | User searches menu | Search term, results count, language |
| `view_item_list` | User selects category | Category name, item count |
| `filter_items` | User applies filters | Filter type and value |
| `language_switch` | User changes language | From/to languages |
| `pickup_time_selected` | User selects pickup time | Time preference |

## 🛠 Implementation Examples

### Tracking Menu Interactions

```tsx
// Track category selection
const handleCategorySelect = (categoryId: string) => {
  const category = categories.find(c => c.id === categoryId);
  if (category) {
    const itemCount = menuData.filter(item => 
      categoryId === 'all' || item.category === categoryId
    ).length;
    
    menuTracking.trackCategorySelection(category.name[language], language, itemCount);
  }
  setSelectedCategory(categoryId);
};

// Track search
const handleSearch = (searchTerm: string) => {
  setSearchQuery(searchTerm);
  
  if (searchTerm.trim()) {
    const resultsCount = filteredItems.length;
    menuTracking.trackSearch(searchTerm, language, resultsCount);
  }
};

// Track filter usage
const handleFilterChange = (filterType: string, value: any) => {
  menuTracking.trackFilter(filterType, String(value), language);
  
  // Your existing filter logic
  if (filterType === 'vegetarian') {
    setShowVegetarianOnly(value);
  }
};
```

### Tracking Checkout Flow

```tsx
// src/app/checkout/page.tsx
import { useOrderTracking } from '@/hooks/useAnalytics';

export default function CheckoutPage() {
  const orderTracking = useOrderTracking();
  const { cart, clearCart, getGrandTotal } = useCart();
  
  // Track checkout start
  useEffect(() => {
    if (cart.items.length > 0) {
      const formattedItems = cart.items.map(item => ({
        id: item.id,
        name: item.menuItem.name[language],
        category: item.menuItem.category,
        price: item.unitPrice,
        quantity: item.quantity
      }));
      
      orderTracking.trackCheckoutStart(formattedItems, getGrandTotal());
    }
  }, []);

  // Track successful order
  const handlePaymentSuccess = (orderData: OrderData) => {
    const formattedItems = cart.items.map(item => ({
      id: item.id,
      name: item.menuItem.name[language],
      category: item.menuItem.category,
      price: item.unitPrice,
      quantity: item.quantity
    }));

    orderTracking.trackOrderComplete({
      orderId: orderData.id,
      totalCents: orderData.totalCents,
      items: formattedItems,
      customerEmail: customerInfo.email
    });

    clearCart();
    router.push('/order-confirmation?order_id=${orderData.id}');
  };
}
```

### Tracking Cart Operations

```tsx
// Add to your CartContext
import { useOrderTracking } from '@/hooks/useAnalytics';

const removeItem = (itemId: string) => {
  // Get item details before removing
  const item = state.items.find(i => i.id === itemId);
  
  dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  
  // Track removal
  if (item) {
    orderTracking.trackCartRemoval({
      id: item.id,
      name: item.menuItem.name.en,
      category: item.menuItem.category,
      price: item.unitPrice,
      quantity: item.quantity
    });
  }
};
```

## 🔍 What You'll See in GA4

### Reports You'll Get

1. **Ecommerce Overview**
   - Total revenue and transactions
   - Average order value
   - Purchase conversion rate

2. **Enhanced Ecommerce**
   - Shopping behavior funnel
   - Checkout behavior funnel
   - Product performance

3. **Custom Events**
   - Menu search behavior
   - Filter usage patterns
   - Language preferences

4. **User Behavior**
   - Most viewed menu items
   - Cart abandonment points
   - Popular categories

### Setting Up GA4 Goals

In GA4, create these conversions:
- `purchase` (auto-created)
- `begin_checkout`
- `add_to_cart`

## 🛡️ Privacy Compliance

### GDPR/CCPA Compliance

The implementation includes:
- ✅ Consent management
- ✅ Cookie notice
- ✅ User opt-out option
- ✅ Data anonymization
- ✅ No personal data tracking

### Consent Flow

1. User visits site
2. Consent notice appears (bottom of page)
3. User can accept or decline
4. Choice saved in localStorage
5. Analytics enabled/disabled accordingly

## 🧪 Testing Your Setup

### Development Testing

1. **Check Console Logs**
   ```bash
   # You should see:
   GA4 Analytics disabled (development mode or missing measurement ID)
   ```

2. **Enable for Development** (Optional)
   ```bash
   # In .env.local, temporarily set:
   NODE_ENV=production
   ```

### Production Testing

1. **Real-time Reports**
   - Open GA4 → Reports → Realtime
   - Navigate your site
   - See events appear in real-time

2. **Event Testing**
   - Add items to cart
   - Complete a test order (with test Stripe card)
   - Check events in GA4 DebugView

### Test Order Flow

1. Browse menu → Check `view_item` events
2. Add to cart → Check `add_to_cart` events
3. Open cart → Check `view_cart` event
4. Start checkout → Check `begin_checkout` event
5. Complete order → Check `purchase` event

## 🚨 Common Issues & Solutions

### GA4 Not Loading

- ✅ Check `NEXT_PUBLIC_GA_MEASUREMENT_ID` in environment
- ✅ Verify measurement ID format: `G-XXXXXXXXXX`
- ✅ Check console for JavaScript errors
- ✅ Ensure you're in production mode

### Events Not Appearing

- ✅ Check GA4 DebugView (may take 24-48 hours for regular reports)
- ✅ Verify event names match GA4 standards
- ✅ Check browser network tab for gtag requests
- ✅ Ensure user has accepted analytics consent

### Development vs Production

- 📍 Analytics only loads in production mode
- 📍 Use DebugView for real-time testing
- 📍 Test with Stripe test cards only

## 📊 Business Insights You'll Gain

### Revenue Analytics
- Daily/weekly/monthly revenue trends
- Average order value by time period
- Revenue by menu category

### Customer Behavior
- Most popular menu items
- Common search terms
- Filter usage patterns
- Language preferences

### Conversion Optimization
- Cart abandonment rates
- Checkout step drop-offs
- Mobile vs desktop performance
- Peak ordering times

### Marketing ROI
- Track promotion effectiveness
- Monitor referral sources
- Measure social media impact
- A/B test menu layouts

This setup gives you enterprise-level analytics for your ordering system, helping you make data-driven decisions to grow your restaurant business! 🚀 