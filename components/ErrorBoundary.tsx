import React, { ErrorInfo, ReactNode } from 'react';
import { ICreditUnionLogo } from './Icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Added a constructor to properly initialize state and props for this class component. This resolves errors where `this.state` and `this.props` were accessed before being assigned.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
          <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
              <div className="text-center max-w-lg">
                  <div className="inline-block p-4 rounded-full shadow-lg bg-slate-900/50 mb-6">
                      <ICreditUnionLogo />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-100 glow-text">An Unexpected Error Occurred</h1>
                  <p className="mt-4 text-slate-300">
                      We're sorry for the inconvenience. Our team has been notified of the issue.
                      Please try refreshing the page to continue.
                  </p>
                  <button
                      onClick={() => window.location.reload()}
                      className="mt-8 inline-flex items-center space-x-3 px-6 py-3 text-md font-bold bg-primary rounded-lg shadow-lg"
                  >
                      <span>Refresh Page</span>
                  </button>
              </div>
          </div>
      );
    }

    return this.props.children;
  }
}