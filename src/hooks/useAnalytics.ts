import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  trackPageView,
  trackAddToCart,
  trackRemoveFromCart,
  trackViewCart,
  trackBeginCheckout,
  trackPurchase,
  trackViewItem,
  trackMenuSearch,
  trackCategoryView,
  trackFilterUsage,
  trackLanguageSwitch,
  trackPickupTimeSelected,
  trackCheckoutProgress,
  trackError,
  trackPerformance
} from '@/lib/analytics';

// Hook for page view tracking
export function usePageTracking() {
  const router = useRouter();
  
  useEffect(() => {
    // Track initial page load
    trackPageView(window.location.pathname);
    
    // Note: Next.js 13+ App Router doesn't have router events
    // Instead, we track in individual pages using PageAnalytics component
    
    return () => {
      // Cleanup if needed
    };
  }, [router]);
}

// Hook for e-commerce tracking in ordering flow
export function useOrderTracking() {
  const hasTrackedCheckout = useRef(false);

  const trackItemView = useCallback((item: {
    id: string;
    name: string;
    category: string;
    price: number;
    language: 'en' | 'zh';
  }) => {
    trackViewItem(item);
  }, []);

  const trackCartAddition = useCallback((item: {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    language: 'en' | 'zh';
  }) => {
    trackAddToCart(item);
  }, []);

  const trackCartRemoval = useCallback((item: {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }) => {
    trackRemoveFromCart(item);
  }, []);

  const trackCartView = useCallback((cartItems: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }>, totalValue: number) => {
    const formattedItems = cartItems.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price / 100, // Convert cents to dollars
      quantity: item.quantity
    }));
    
    trackViewCart(formattedItems, totalValue / 100);
  }, []);

  const trackCheckoutStart = useCallback((cartItems: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }>, totalValue: number) => {
    if (hasTrackedCheckout.current) return; // Prevent duplicate tracking
    
    const formattedItems = cartItems.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price / 100,
      quantity: item.quantity
    }));
    
    trackBeginCheckout(formattedItems, totalValue / 100);
    hasTrackedCheckout.current = true;
  }, []);

  const trackOrderComplete = useCallback((orderData: {
    orderId: string;
    totalCents: number;
    items: Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      quantity: number;
    }>;
    customerEmail?: string;
  }) => {
    const formattedItems = orderData.items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price / 100,
      quantity: item.quantity
    }));

    trackPurchase({
      transaction_id: orderData.orderId,
      value: orderData.totalCents / 100,
      currency: 'USD',
      items: formattedItems,
      customer_email: orderData.customerEmail
    });
  }, []);

  const trackCheckoutStep = useCallback((step: number, option: string, value: number) => {
    trackCheckoutProgress(step, option, value / 100);
  }, []);

  return {
    trackItemView,
    trackCartAddition,
    trackCartRemoval,
    trackCartView,
    trackCheckoutStart,
    trackOrderComplete,
    trackCheckoutStep,
    resetCheckoutTracking: () => { hasTrackedCheckout.current = false; }
  };
}

// Hook for menu interaction tracking
export function useMenuTracking() {
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const trackSearch = useCallback((searchTerm: string, language: 'en' | 'zh', resultsCount: number) => {
    // Debounce search tracking to avoid too many events
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (searchTerm.trim().length > 2) { // Only track meaningful searches
        trackMenuSearch(searchTerm.trim(), language, resultsCount);
      }
    }, 1000);
  }, []);

  const trackCategorySelection = useCallback((category: string, language: 'en' | 'zh', itemCount: number) => {
    trackCategoryView(category, language, itemCount);
  }, []);

  const trackFilter = useCallback((filterType: string, filterValue: string, language: 'en' | 'zh') => {
    trackFilterUsage(filterType, filterValue, language);
  }, []);

  const trackLanguageChange = useCallback((fromLang: string, toLang: string) => {
    trackLanguageSwitch(fromLang, toLang);
  }, []);

  const trackPickupTime = useCallback((pickupTime: string) => {
    const selectedDate = new Date(pickupTime);
    const now = new Date();
    const minutesFromNow = Math.round((selectedDate.getTime() - now.getTime()) / (1000 * 60));
    
    trackPickupTimeSelected(pickupTime, minutesFromNow);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    trackSearch,
    trackCategorySelection,
    trackFilter,
    trackLanguageChange,
    trackPickupTime
  };
}

// Hook for error and performance tracking
export function useErrorTracking() {
  const trackAppError = useCallback((error: Error, page: string, errorType: string = 'runtime_error') => {
    trackError(errorType, error.message, page);
    
    // Also log to console for debugging
    console.error(`[Analytics] ${errorType} on ${page}:`, error);
  }, []);

  const trackApiError = useCallback((endpoint: string, statusCode: number, errorMessage: string) => {
    trackError('api_error', `${endpoint} - ${statusCode}: ${errorMessage}`, window.location.pathname);
  }, []);

  const trackPerformanceMetric = useCallback((metric: string, value: number) => {
    trackPerformance(metric, value, window.location.pathname);
  }, []);

  return {
    trackAppError,
    trackApiError,
    trackPerformanceMetric
  };
}

// Hook for comprehensive cart tracking with automatic events
export function useCartAnalytics() {
  const { trackCartAddition, trackCartView } = useOrderTracking();
  const lastCartSize = useRef(0);
  const lastCartValue = useRef(0);

  const trackCartChange = useCallback((
    cartItems: Array<{
      id: string;
      menuItem: { name: { en: string; zh: string }; category: string };
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>,
    language: 'en' | 'zh',
    action?: 'add' | 'remove'
  ) => {
    const currentSize = cartItems.length;
    const currentValue = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Track specific add/remove actions
    if (action === 'add') {
      const lastItem = cartItems[cartItems.length - 1];
      if (lastItem) {
        trackCartAddition({
          id: lastItem.id,
          name: lastItem.menuItem.name[language],
          category: lastItem.menuItem.category,
          price: lastItem.unitPrice,
          quantity: lastItem.quantity,
          language
        });
      }
    } else if (action === 'remove' && lastCartSize.current > currentSize) {
      // Item was removed - we can't track the specific item here
      // This would need to be tracked at the component level
    }

    // Track cart view if value changed significantly
    if (Math.abs(currentValue - lastCartValue.current) > 100) { // More than $1 change
      const formattedItems = cartItems.map(item => ({
        id: item.id,
        name: item.menuItem.name[language],
        category: item.menuItem.category,
        price: item.unitPrice,
        quantity: item.quantity
      }));
      
      trackCartView(formattedItems, currentValue);
    }

    lastCartSize.current = currentSize;
    lastCartValue.current = currentValue;
  }, [trackCartAddition, trackCartView]);

  return {
    trackCartChange
  };
} 