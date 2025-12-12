<<<<<<< HEAD
import * as Sentry from "@sentry/react";
import { Component, ErrorInfo, ReactNode } from "react";
=======
import { Component, ReactNode } from "react";
>>>>>>> 2841dc2 (feat: add sentry & OTEL)

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

<<<<<<< HEAD
/**
 * @class ErrorBoundary
 * @description A React Class Component that catches JavaScript errors
 * anywhere in its child component tree, logs those errors to Sentry,
 * and displays a fallback UI instead of crashing the entire application.
 */
=======
>>>>>>> 2841dc2 (feat: add sentry & OTEL)
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

<<<<<<< HEAD
  // Lifecycle method for logging error information
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service like Sentry
    Sentry.captureException(error, { extra: errorInfo });
    console.error("Error caught by boundary:", error, errorInfo);
=======
  componentDidCatch(error: Error, info: any) {
    console.error("ErrorBoundary caught an error:", error, info);
>>>>>>> 2841dc2 (feat: add sentry & OTEL)
  }

  render() {
    if (this.state.hasError) {
      return (
<<<<<<< HEAD
        <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-4">
          {/* Glassmorphism Card (bg-black/30 backdrop-blur-lg) */}
          <div className="bg-black/30 backdrop-blur-lg rounded-xl p-8 max-w-lg w-full shadow-2xl shadow-red-900/40 border border-gray-700/50 animate-fade-in">
            {/* Header Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="p-5 bg-red-600/30 rounded-full border border-red-500/50 animate-ping-slow">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Main Message */}
            <h1 className="text-3xl font-extrabold text-white text-center mb-3">
              Critical System Failure
            </h1>
            <p className="text-gray-400 text-center mb-6">
              We encountered an unrecoverable error. The incident has been
              automatically logged with Sentry.
            </p>

            {/* Interactive Error Details Toggle */}
            {this.state.error && (
              <div className="mb-6">
                <button
                  onClick={() =>
                    this.setState((prev) => ({
                      showDetails: !prev.showDetails,
                    }))
                  }
                  className="w-full text-center text-sm font-semibold text-red-400 hover:text-red-300 transition-colors border-b border-red-400/50 pb-1 flex items-center justify-center gap-2"
                >
                  {this.state.showDetails
                    ? "Hide Technical Details"
                    : "Show Technical Details"}
                  <svg
                    className={`w-4 h-4 transform transition-transform ${this.state.showDetails ? "rotate-180" : "rotate-0"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Error Details Pane (Collapsible/Interactive) */}
                {this.state.showDetails && (
                  <div className="bg-gray-800/60 rounded-lg p-4 mt-3 border border-gray-700 shadow-inner max-h-40 overflow-y-auto transition-opacity duration-300">
                    <h4 className="text-sm text-red-300 mb-1">
                      Error Message:
                    </h4>
                    <pre className="text-red-400 text-xs font-mono whitespace-pre-wrap">
                      {this.state.error.message}
                    </pre>
                    {/* Optionally add: {this.state.error.stack && <pre className="text-red-500 text-xs font-mono mt-2">{this.state.error.stack}</pre>} */}
                  </div>
                )}
              </div>
            )}

            {/* Call to Action Button (Interactive) */}
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-lg font-extrabold transition-all duration-300 transform hover:scale-[1.02] shadow-xl shadow-blue-500/30 text-white"
            >
              Attempt Recovery (Reload Page)
            </button>

            {/* Footer Note */}
            <p className="text-xs text-gray-500 text-center mt-4">
              If the issue persists, please clear your browser cache.
            </p>
=======
        <div
          className="
            p-8 rounded-2xl
            bg-red-50/90 backdrop-blur-md
            border border-red-200
            shadow-xl
            flex flex-col items-start
          "
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">⚠️</span>
            <h2 className="text-2xl font-bold text-red-700 tracking-wide">
              Something went wrong
            </h2>
>>>>>>> 2841dc2 (feat: add sentry & OTEL)
          </div>

          <p className="text-red-600 font-medium mb-4">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="
              mt-2
              bg-red-600 hover:bg-red-700 
              text-white px-4 py-2 rounded-xl
              shadow-md hover:shadow-lg
              transition duration-300
            "
          >
            🔄 Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
