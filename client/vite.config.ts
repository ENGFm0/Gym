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
  build: { outDir: "dist", sourcemap: false }
});
