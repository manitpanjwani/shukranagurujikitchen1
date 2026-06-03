// @lovable.dev/vite-tanstack-config already includes tanstackStart, viteReact,
// tailwindcss, tsConfigPaths, nitro (Lovable sandbox/prod), etc.
// We add the official Netlify adapter so `bun run build` produces a Netlify-ready
// output in `.output/public` (client) and `.output/server` (functions).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import netlify from "@netlify/vite-plugin-tanstack-start";

export default defineConfig({
  plugins: [netlify()],
  tanstackStart: {
    server: { entry: "server" },
  },
});
