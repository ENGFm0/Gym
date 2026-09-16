import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.fitcore.mobile",
  appName: "FitCore",
  // The shell ships the same build the website serves.
  webDir: "../client/dist",
  ios: { contentInset: "always" },
  android: { allowMixedContent: false },
  server: {
    androidScheme: "https"
  }
};

export default config;
