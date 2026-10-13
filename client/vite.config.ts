import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  css: {
    postcss: {
      plugins: [],
    },
  },
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
