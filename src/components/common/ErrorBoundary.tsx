/**
 * ErrorBoundary Component
 * Catches React errors and displays fallback UI
 */

import { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  /** Child components */
  children: ReactNode;

  /** Optional fallback UI */
  fallback?: ReactNode;

  /** Optional error callback */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for graceful error handling
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-apple-bg-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <span className="text-6xl">⚠️</span>
            </div>

            <h1 className="text-2xl font-semibold text-apple-text-primary mb-2">
              Something went wrong
            </h1>

            <p className="text-apple-text-secondary mb-6">
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-6 py-3 bg-apple-accent text-white rounded-apple-lg font-medium hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-apple-accent focus:ring-offset-2"
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-apple-bg-secondary text-apple-text-primary rounded-apple-lg font-medium hover:bg-apple-bg-tertiary transition-all focus:outline-none focus:ring-2 focus:ring-apple-accent focus:ring-offset-2"
              >
                Reload Page
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-apple-text-secondary hover:text-apple-text-primary">
                  Error details
                </summary>
                <pre className="mt-2 p-4 bg-apple-bg-secondary rounded-apple-md text-xs overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
