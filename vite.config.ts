import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    base: process.env.NODE_ENV === "production" ? "/shukranagurujikitchen1/" : "/",
    build: {
      outDir: "dist",
    },
  },
  tanstackStart: {
    spa: { enabled: true, maskPath: "/" },
  },
});
