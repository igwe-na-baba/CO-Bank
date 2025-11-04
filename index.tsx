import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Changed to a default import to resolve the module resolution issue as 'App' is a default export.
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* FIX: Wrapped the App component with the ErrorBoundary to catch potential rendering errors. This was likely already done but the error was stale. */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);