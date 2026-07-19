import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.config.ts";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  server: {
    // required so the extension's chrome-extension:// origin can reach the vite dev server for HMR
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
});
