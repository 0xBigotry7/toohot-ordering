// Google Analytics 4 configuration and tracking functions
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// GA4 Measurement ID - add this to your environment variables
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Initialize GA4
export const initGA = () => {
  if (!GA_MEASUREMENT_ID || process.env.NODE_ENV !== 'production') {
    console.log('GA4 not initialized - missing ID or not in production');
    return;
  }

  // Load gtag script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', {
      page_title: document.title,
      page_location: window.location.href,
    });
  `;
  document.head.appendChild(script2);
};

// Generic gtag wrapper
export const gtag = (...args: unknown[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

// Page view tracking
export const trackPageView = (url: string, title?: string) => {
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title || document.title,
  });
};

// Event tracking interfaces
interface MenuItem {
  item_id: string;
  item_name: string;
  item_category: string;
  price: number;
  quantity?: number;
}

interface PurchaseData {
  transaction_id: string;
  value: number;
  currency: string;
  items: MenuItem[];
  customer_email?: string;
}

// E-commerce Events for Restaurant Ordering

// Track when user views a menu item
export const trackViewItem = (item: {
  id: string;
  name: string;
  category: string;
  price: number;
  language: 'en' | 'zh';
}) => {
  gtag('event', 'view_item', {
    currency: 'USD',
    value: item.price,
    items: [{
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: 1
    }],
    custom_parameters: {
      language: item.language,
      page_type: 'menu'
    }
  });
};

// Track when user adds item to cart
export const trackAddToCart = (item: {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  language: 'en' | 'zh';
}) => {
  gtag('event', 'add_to_cart', {
    currency: 'USD',
    value: item.price * item.quantity,
    items: [{
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity
    }],
    custom_parameters: {
      language: item.language
    }
  });
};

// Track when user removes item from cart
export const trackRemoveFromCart = (item: {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}) => {
  gtag('event', 'remove_from_cart', {
    currency: 'USD',
    value: item.price * item.quantity,
    items: [{
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity
    }]
  });
};

// Track when user views cart
export const trackViewCart = (cartItems: MenuItem[], totalValue: number) => {
  gtag('event', 'view_cart', {
    currency: 'USD',
    value: totalValue,
    items: cartItems
  });
};

// Track when user begins checkout
export const trackBeginCheckout = (cartItems: MenuItem[], totalValue: number) => {
  gtag('event', 'begin_checkout', {
    currency: 'USD',
    value: totalValue,
    items: cartItems,
    custom_parameters: {
      checkout_step: 1,
      checkout_option: 'customer_info'
    }
  });
};

// Track checkout progress
export const trackCheckoutProgress = (step: number, option: string, value: number) => {
  gtag('event', 'checkout_progress', {
    checkout_step: step,
    checkout_option: option,
    currency: 'USD',
    value: value,
    custom_parameters: {
      funnel_step: step === 1 ? 'customer_info' : step === 2 ? 'payment' : 'confirmation'
    }
  });
};

// Track successful purchase
export const trackPurchase = (purchaseData: PurchaseData) => {
  gtag('event', 'purchase', {
    transaction_id: purchaseData.transaction_id,
    value: purchaseData.value,
    currency: purchaseData.currency,
    items: purchaseData.items,
    custom_parameters: {
      payment_method: 'stripe',
      fulfillment_method: 'pickup',
      customer_type: purchaseData.customer_email ? 'registered' : 'guest'
    }
  });
};

// Custom events for restaurant-specific actions

// Track menu search
export const trackMenuSearch = (searchTerm: string, language: 'en' | 'zh', resultsCount: number) => {
  gtag('event', 'search', {
    search_term: searchTerm,
    custom_parameters: {
      language: language,
      results_count: resultsCount,
      search_type: 'menu_search'
    }
  });
};

// Track category selection
export const trackCategoryView = (category: string, language: 'en' | 'zh', itemCount: number) => {
  gtag('event', 'view_item_list', {
    item_list_name: category,
    custom_parameters: {
      language: language,
      items_count: itemCount,
      list_type: 'category'
    }
  });
};

// Track filter usage
export const trackFilterUsage = (filterType: string, filterValue: string, language: 'en' | 'zh') => {
  gtag('event', 'filter_items', {
    filter_type: filterType,
    filter_value: filterValue,
    custom_parameters: {
      language: language
    }
  });
};

// Track language switching
export const trackLanguageSwitch = (fromLang: string, toLang: string) => {
  gtag('event', 'language_switch', {
    previous_language: fromLang,
    new_language: toLang,
    custom_parameters: {
      user_preference: toLang
    }
  });
};

// Track pickup time selection
export const trackPickupTimeSelected = (pickupTime: string, minutesFromNow: number) => {
  gtag('event', 'pickup_time_selected', {
    pickup_time: pickupTime,
    custom_parameters: {
      minutes_from_now: minutesFromNow,
      time_preference: minutesFromNow < 120 ? 'asap' : 'scheduled'
    }
  });
};

// Track order status updates (for customer experience)
export const trackOrderStatusUpdate = (orderId: string, oldStatus: string, newStatus: string) => {
  gtag('event', 'order_status_update', {
    transaction_id: orderId,
    previous_status: oldStatus,
    new_status: newStatus,
    custom_parameters: {
      order_tracking: true
    }
  });
};

// Track errors and technical issues
export const trackError = (errorType: string, errorMessage: string, page: string) => {
  gtag('event', 'exception', {
    description: `${errorType}: ${errorMessage}`,
    fatal: false,
    custom_parameters: {
      error_type: errorType,
      page: page,
      timestamp: new Date().toISOString()
    }
  });
};

// Track performance metrics
export const trackPerformance = (metric: string, value: number, page: string) => {
  gtag('event', 'timing_complete', {
    name: metric,
    value: Math.round(value),
    custom_parameters: {
      page: page,
      metric_type: 'performance'
    }
  });
}; 