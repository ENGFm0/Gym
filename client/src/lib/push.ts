/**
 * Push, and the service worker that carries it.
 *
 * The worker is registered on every load (it is also what makes the app openable offline);
 * a push token is only asked for when the member taps, because an unprompted permission
 * dialog is the fastest way to get permanently denied.
 */
import { api, isOffline } from "./api";
import { isConfigured } from "./firebase";

export const pushSupported = () =>
  typeof navigator !== "undefined" && "serviceWorker" in navigator && "Notification" in window;

export async function registerWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return null; // an unsupported browser or a blocked scope: the app still runs
  }
}

export type PushState = "granted" | "denied" | "unsupported" | "unavailable";

/** Asks for permission, then hands the token to the API so it can reach this device. */
export async function enablePush(lang: string): Promise<PushState> {
  if (!pushSupported()) return "unsupported";
  if (isOffline || !isConfigured) return "unavailable";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";

  const registration = (await navigator.serviceWorker.getRegistration()) ?? (await registerWorker());
  if (!registration) return "unsupported";

  try {
    const { getMessaging, getToken } = await import("firebase/messaging");
    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) return "unavailable";
    await api.registerDevice({ token, platform: "web", lang });
    return "granted";
  } catch {
    return "unavailable";
  }
}

/** The worker asks the app to navigate when a notification is tapped. */
export function listenForNotificationTaps(navigate: (route: string) => void) {
  if (!("serviceWorker" in navigator)) return () => {};

  const handler = (event: MessageEvent) => {
    if (event.data?.type === "navigate" && typeof event.data.route === "string") navigate(event.data.route);
  };

  navigator.serviceWorker.addEventListener("message", handler);
  return () => navigator.serviceWorker.removeEventListener("message", handler);
}
