import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) }
  },
  server: {
    port: 5173,
    proxy: {
      // The API runs on its own port in development; the browser sees one origin.
      "/api": { target: "http://localhost:5126", changeOrigin: true }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        // Three groups that change at different rates: the libraries almost never, the app
        // on every deploy. Splitting them keeps a return visit from re-downloading Firebase
        // because a label moved, and lets the browser fetch them in parallel.
        manualChunks: {
          firebase: ["firebase/app", "firebase/auth", "firebase/messaging"],
          react: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query", "zustand"]
        }
      }
    }
  }
});
