import React from "react";

// Catches render-time errors in the tree below it so a single component
// failure doesn't blank the entire app.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white p-4">
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400 mb-6 text-center max-w-md">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => {
              this.handleReset();
              window.location.assign("/");
            }}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md cursor-pointer transition-colors"
          >
            Go home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
