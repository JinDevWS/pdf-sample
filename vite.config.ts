import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
  },
  build: {
    minify: mode === "production",
  },
}));
