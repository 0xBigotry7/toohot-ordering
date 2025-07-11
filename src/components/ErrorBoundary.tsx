'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{error: Error; resetError: () => void}>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you'd send this to your error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            resetError={() => this.setState({ hasError: false, error: null })}
          />
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-4">😕</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">
                We&apos;re sorry for the inconvenience. Please try refreshing the page.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 