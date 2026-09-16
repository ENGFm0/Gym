import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { paint, useUi } from "./state/ui";
import { registerWorker } from "./lib/push";
import "./styles/index.css";

const { lang, theme } = useUi.getState();
paint(lang, theme);

// The icon font may not arrive (offline, blocked CDN); without this its ligature
// names render as words. document.fonts.check() is not enough — it answers true for
// a fallback family — so the face itself has to be in the document's font set.
document.documentElement.classList.add("icons-missing");
if (document.fonts?.ready) {
  document.fonts.ready.then(() => {
    const loaded = Array.from(document.fonts).some((face) => face.family.includes("Material Symbols"));
    if (loaded) document.documentElement.classList.remove("icons-missing");
  });
}

// The worker is what makes the app openable offline; push is asked for separately, on a tap.
void registerWorker();

const client = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 15_000 } }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={client}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
