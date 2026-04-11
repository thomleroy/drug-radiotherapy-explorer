import React from 'react';
import { AlertCircle } from 'lucide-react';

const ERROR_BOUNDARY_STRINGS = {
  en: {
    title: 'Oops! Something went wrong',
    description: 'The application encountered an unexpected error. Please refresh the page.',
    refresh: 'Refresh Page',
  },
  fr: {
    title: 'Oups ! Une erreur est survenue',
    description: "L'application a rencontré une erreur inattendue. Veuillez rafraîchir la page.",
    refresh: 'Rafraîchir la page',
  },
};

// Top-level Error Boundary. Renders a bilingual fallback when a child
// component throws, with an optional `window.__errorHandler` hook for an
// external reporter (Sentry, etc.).
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Drug Explorer Error:', error, errorInfo);
    }
    if (typeof window !== 'undefined' && typeof window.__errorHandler === 'function') {
      try {
        window.__errorHandler(error, errorInfo);
      } catch {
        /* never let the reporter itself crash the boundary */
      }
    }
  }

  render() {
    if (this.state.hasError) {
      let lang = 'en';
      try {
        const stored = typeof window !== 'undefined'
          ? window.localStorage.getItem('drug-explorer-lang')
          : null;
        if (stored === 'fr' || stored === 'en') lang = stored;
      } catch {
        lang = 'en';
      }
      const strings = ERROR_BOUNDARY_STRINGS[lang];
      const showDetails = process.env.NODE_ENV !== 'production' && this.state.error;

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{strings.title}</h2>
            <p className="text-gray-600 mb-4">{strings.description}</p>
            {showDetails && (
              <pre className="text-left text-xs bg-gray-100 text-gray-700 p-3 rounded mb-4 overflow-auto max-h-40">
                {String(this.state.error?.message || this.state.error)}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-sfro-primary text-white px-6 py-2 rounded-lg hover:bg-sfro-secondary transition-colors"
            >
              {strings.refresh}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
