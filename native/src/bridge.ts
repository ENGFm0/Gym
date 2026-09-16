/**
 * Publishes window.FitCoreNative for the web app.
 *
 * Load this once at shell start-up, before the web view navigates. Swap the two plugin calls
 * for whichever health plugin you settle on — the shape the web app reads stays the same.
 */
import { Capacitor } from "@capacitor/core";

type StepHandler = (steps: number) => void;

interface HealthPlugin {
  requestAuthorization(options: { read: string[] }): Promise<{ granted: boolean }>;
  queryTotal(options: { dataType: string; startDate: string; endDate: string }): Promise<{ value: number }>;
}

// Replace with the plugin you install; both iOS and Android wrappers expose this pair.
declare const Health: HealthPlugin;

const dayBounds = (date: string) => {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
};

let granted = false;

async function requestHealthPermission(): Promise<boolean> {
  if (granted) return true;
  try {
    const result = await Health.requestAuthorization({ read: ["steps"] });
    granted = result.granted;
    return granted;
  } catch {
    return false;
  }
}

async function getSteps(date: string): Promise<number> {
  if (!(await requestHealthPermission())) return 0;
  const { startDate, endDate } = dayBounds(date);
  const result = await Health.queryTotal({ dataType: "steps", startDate, endDate });
  return Math.max(0, Math.round(result.value ?? 0));
}

/** Polls while the app is in the foreground; the platforms do not push step updates. */
function watchSteps(handler: StepHandler): () => void {
  const today = () => new Date().toISOString().slice(0, 10);
  const tick = async () => {
    try {
      handler(await getSteps(today()));
    } catch {
      /* the member may have revoked permission; the web app keeps its last value */
    }
  };

  void tick();
  const timer = window.setInterval(tick, 60_000);
  return () => window.clearInterval(timer);
}

window.FitCoreNative = {
  platform: Capacitor.getPlatform() === "ios" ? "ios" : "android",
  requestHealthPermission,
  getSteps,
  watchSteps
};

declare global {
  interface Window {
    FitCoreNative?: {
      platform: "ios" | "android";
      requestHealthPermission(): Promise<boolean>;
      getSteps(date: string): Promise<number>;
      watchSteps(handler: StepHandler): () => void;
    };
  }
}

export {};
