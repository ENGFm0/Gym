# FitCore native shell

The web app is the whole product except for two things a browser cannot do: read Apple Health
or Health Connect, and keep counting steps in the background. This folder is the thin native
wrapper that supplies exactly those, and nothing else — the UI stays the React app.

## How the bridge works

The shell injects `window.FitCoreNative` into the web view. The web app looks for it
(`client/src/lib/native.ts`) and, when it is there, takes steps from the platform instead of
the device-motion pedometer. When it is absent — a plain browser — the pedometer stays.

```ts
interface NativeBridge {
  getSteps(date: string): Promise<number>;        // yyyy-MM-dd
  requestHealthPermission(): Promise<boolean>;
  watchSteps(handler: (steps: number) => void): () => void;
  platform: "ios" | "android";
}
```

## Building it

```bash
cd client && npm run build            # the shell serves this dist
cd ../native
npm install
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios                      # or android
```

`capacitor.config.ts` points `webDir` at `../client/dist`, so a web build is all that a
native build needs.

## The health plugin

Use `@perfood/capacitor-healthkit` on iOS and `capacitor-health-connect` on Android, then
publish the bridge in `src/bridge.ts` — the file is written against the interface above, so
the web app needs no change when you swap plugins.

Permissions to declare:

- **iOS** — `NSHealthShareUsageDescription` in `Info.plist`, and the HealthKit capability.
- **Android** — `android.permission.health.READ_STEPS` plus the Health Connect intent filter.

Apple requires that a health permission prompt explains itself: the string should say the app
reads step counts to show them next to the day's calories, and nothing else.
