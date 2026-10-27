import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  /** Custom fallback - receives error + reset function. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Route-level error boundary.
 * Catches render errors and shows a recoverable error screen.
 * All celebration / skeleton components are safe-wrapped with this.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production we'd send to Sentry here.
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
      >
        <span className="text-5xl mb-4" aria-hidden="true">😵</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          A part of this page crashed. Your data is safe - this is an isolated error.
        </p>
        <button
          onClick={this.reset}
          className="bg-indigo-600 text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 min-h-[44px]"
        >
          Try again
        </button>
        {import.meta.env.DEV && (
          <pre className="mt-6 text-left text-xs text-red-600 bg-red-50 rounded p-3 max-w-full overflow-x-auto">
            {error.message}
          </pre>
        )}
      </div>
    );
  }
}
