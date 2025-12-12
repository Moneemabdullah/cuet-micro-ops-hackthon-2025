import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
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
