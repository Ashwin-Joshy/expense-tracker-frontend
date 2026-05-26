import { Component, type ErrorInfo, type ReactNode } from "react";
import Button from "./Button";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
          <div className="max-w-md text-center space-y-4">
            <div className="text-4xl font-black tracking-tight text-rose-400">
              Something went wrong
            </div>
            <p className="text-sm text-zinc-400">
              An unexpected error occurred. You can try reloading the app.
            </p>
            <pre className="mt-2 max-h-32 overflow-auto rounded-lg border border-white/10 bg-white/5 p-3 text-left text-xs text-zinc-400">
              {this.state.error.message}
            </pre>
            <Button onClick={() => window.location.reload()}>
              Reload App
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
