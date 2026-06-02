// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // SPA mode: produces a static index.html shell that hydrates client-side.
    // This is what makes Netlify static hosting work — `dist/index.html` + `_redirects`
    // is all Netlify needs. No SSR worker required.
    spa: {
      enabled: true,
      maskPath: "/",
    },
    server: { entry: "server" },
  },
});
