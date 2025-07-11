'use client';

import { useEffect, createContext, useContext, ReactNode } from 'react';
import { initGA, GA_MEASUREMENT_ID } from '@/lib/analytics';
import { usePageTracking } from '@/hooks/useAnalytics';

interface AnalyticsContextType {
  isEnabled: boolean;
  measurementId?: string;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  isEnabled: false
});

export const useAnalyticsContext = () => useContext(AnalyticsContext);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const isEnabled = !!GA_MEASUREMENT_ID && process.env.NODE_ENV === 'production';

  useEffect(() => {
    if (isEnabled) {
      initGA();
      console.log('GA4 Analytics initialized');
    } else {
      console.log('GA4 Analytics disabled (development mode or missing measurement ID)');
    }
  }, [isEnabled]);

  const contextValue: AnalyticsContextType = {
    isEnabled,
    measurementId: GA_MEASUREMENT_ID
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Component to add to individual pages for automatic page tracking
export function PageAnalytics() {
  usePageTracking();
  return null;
}

// Privacy-compliant analytics notice component
interface AnalyticsNoticeProps {
  language: 'en' | 'zh';
  onAccept: () => void;
  onDecline: () => void;
  isVisible: boolean;
}

export function AnalyticsNotice({ language, onAccept, onDecline, isVisible }: AnalyticsNoticeProps) {
  if (!isVisible) return null;

  const text = {
    en: {
      title: 'We use cookies',
      message: 'We use analytics cookies to help us understand how you use our website and improve your experience.',
      accept: 'Accept',
      decline: 'Decline',
      learnMore: 'Learn more'
    },
    zh: {
      title: '我们使用 Cookie',
      message: '我们使用分析 Cookie 来帮助我们了解您如何使用我们的网站并改善您的体验。',
      accept: '接受',
      decline: '拒绝',
      learnMore: '了解更多'
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {text[language].title}
            </h3>
            <p className="text-sm text-gray-600">
              {text[language].message}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onDecline}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              {text[language].decline}
            </button>
            <button
              onClick={onAccept}
              className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors"
              style={{ backgroundColor: '#B87333' }}
            >
              {text[language].accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for managing analytics consent
export function useAnalyticsConsent() {
  const CONSENT_KEY = 'toohot-analytics-consent';

  const getConsent = (): boolean | null => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(CONSENT_KEY);
    return saved ? JSON.parse(saved) : null;
  };

  const setConsent = (consent: boolean) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    
    // Update GA4 consent
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: consent ? 'granted' : 'denied',
        ad_storage: 'denied', // We don't use ads
        functionality_storage: 'granted',
        personalization_storage: consent ? 'granted' : 'denied',
        security_storage: 'granted'
      });
    }
  };

  return { getConsent, setConsent };
} 