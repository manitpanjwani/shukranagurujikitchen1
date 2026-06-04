import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    base: "/shukranagurujikitchen1/",
    build: {
      outDir: "dist",
    },
  },
  tanstackStart: {
    spa: { enabled: true, maskPath: "/" },
  },
});
