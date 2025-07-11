import { useState, useCallback } from 'react';

interface ApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
}

interface ApiRequestOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  onError?: (error: Error) => void;
  onSuccess?: <T>(data: T) => void;
}

export function useApiRequest<T = unknown>(options: ApiRequestOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 10000,
    onError,
    onSuccess
  } = options;

  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0
  });

  const makeRequest = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        setState({
          data,
          loading: false,
          error: null,
          retryCount: attempt
        });

        onSuccess?.(data);
        return data;

      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        
        if (isLastAttempt) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'An unexpected error occurred';
          
          setState({
            data: null,
            loading: false,
            error: errorMessage,
            retryCount: attempt
          });

          onError?.(error instanceof Error ? error : new Error(errorMessage));
          return null;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }

    return null;
  }, [maxRetries, retryDelay, timeout, onError, onSuccess]);

  const retry = useCallback(() => {
    setState(prev => ({ ...prev, error: null, retryCount: 0 }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      retryCount: 0
    });
  }, []);

  return {
    ...state,
    makeRequest,
    retry,
    reset,
    isRetrying: state.retryCount > 0 && state.loading
  };
}

// Specialized hooks for common operations
export function useOrderApi() {
  return useApiRequest({
    maxRetries: 2,
    retryDelay: 1500,
    timeout: 15000, // Orders might take longer
    onError: (error) => {
      console.error('Order API Error:', error);
      // Could integrate with error reporting service here
    }
  });
}

export function useMenuApi() {
  return useApiRequest({
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 8000,
    onError: (error) => {
      console.error('Menu API Error:', error);
    }
  });
}

export function usePaymentApi() {
  return useApiRequest({
    maxRetries: 1, // Don't retry payments to avoid double charges
    retryDelay: 0,
    timeout: 30000, // Payment processing can take longer
    onError: (error) => {
      console.error('Payment API Error:', error);
    }
  });
} 