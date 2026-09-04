"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, State> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    // Replace with a real logger like Sentry
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="text-muted-foreground text-sm">
              {this.state.message}
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={this.handleReset}>Try again</Button>
              <Button
                variant="outline"
                onClick={() => window.location.assign("/")}
              >
                Go to home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
