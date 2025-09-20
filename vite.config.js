import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// replace with your repo name if different
export default defineConfig({
  plugins: [react()],
  base: "/workout-tracker/",
});
