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
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: "var(--color-surface)" }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>Something went wrong</h1>
          <p className="mb-6 text-center max-w-md" style={{ color: "var(--color-text-secondary)" }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => {
              this.handleReset();
              window.location.assign("/");
            }}
            className="px-6 py-2 rounded-lg cursor-pointer transition-all duration-200 font-semibold"
            style={{ background: "var(--color-accent)", color: "#060010" }}
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
