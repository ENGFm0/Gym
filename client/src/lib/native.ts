/**
 * The bridge to a native shell.
 *
 * Apple Health has no web API and Google Fit's REST API is on its way out, so real step
 * counts come from a native wrapper (Capacitor) that reads HealthKit or Health Connect and
 * injects this object into the web view. On a plain browser the object is absent and the
 * app falls back to the device-motion pedometer — no pretending either way.
 */

export interface NativeBridge {
  /** Steps for a given yyyy-MM-dd, from HealthKit or Health Connect. */
  getSteps?(date: string): Promise<number>;
  /** Asks the platform for health permission; resolves false when the member declines. */
  requestHealthPermission?(): Promise<boolean>;
  /** Live step updates while the app is open. Returns an unsubscribe. */
  watchSteps?(handler: (steps: number) => void): () => void;
  platform?: "ios" | "android";
}

declare global {
  interface Window {
    FitCoreNative?: NativeBridge;
  }
}

export const native = (): NativeBridge | undefined =>
  typeof window === "undefined" ? undefined : window.FitCoreNative;

export const hasHealthSource = () => Boolean(native()?.getSteps);

export async function healthSteps(date: string): Promise<number | null> {
  const bridge = native();
  if (!bridge?.getSteps) return null;

  try {
    if (bridge.requestHealthPermission) {
      const granted = await bridge.requestHealthPermission();
      if (!granted) return null;
    }
    const steps = await bridge.getSteps(date);
    return Number.isFinite(steps) ? Math.max(0, Math.round(steps)) : null;
  } catch {
    return null;
  }
}

export function watchHealthSteps(handler: (steps: number) => void): () => void {
  const bridge = native();
  if (!bridge?.watchSteps) return () => {};
  try {
    return bridge.watchSteps(handler);
  } catch {
    return () => {};
  }
}
