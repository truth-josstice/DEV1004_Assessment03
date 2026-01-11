import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    host: true,
  },
  test: {
    globals: true, // Lets us use globals like "describe", "test" and "it"
    environment: "jsdom", // Lets us test DOM manipulation by simulating browser environment
    setupFiles: "./src/setupTests.js", // Global test setup
    testTimeout: 15000, // Increase test timeout to 15 seconds
  },
});
