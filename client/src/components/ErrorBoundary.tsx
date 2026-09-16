import { Component, type ErrorInfo, type ReactNode } from "react";
import { api } from "@/lib/api";

/**
 * A crash the app survives. Without this the screen goes white and nobody ever hears about it —
 * it happened on someone's phone, in their gym.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void api.reportError({
      message: error.message,
      stack: `${error.stack ?? ""}\n--- component ---${info.componentStack ?? ""}`,
      route: window.location.pathname + window.location.hash,
      agent: navigator.userAgent
    });
  }

  render() {
    if (!this.state.crashed) return this.props.children;

    const arabic = document.documentElement.lang !== "en";

    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-gutter">
        <div className="max-w-sm w-full rounded-2xl bg-surface-container p-6 text-center">
          <div className="text-title-md text-on-surface">
            {arabic ? "صار خلل بالشاشة" : "Something broke on this screen"}
          </div>
          <p className="text-label-sm text-on-surface-variant mt-2">
            {arabic
              ? "بياناتك محفوظة. أعد التحميل وكمّل من مكانك."
              : "Your data is safe. Reload and pick up where you were."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="tap mt-4 w-full h-12 rounded-xl bg-primary-fixed text-on-primary-fixed text-label-lg"
          >
            {arabic ? "أعد التحميل" : "Reload"}
          </button>
        </div>
      </div>
    );
  }
}
