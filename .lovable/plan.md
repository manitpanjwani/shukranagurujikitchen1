I found the likely cause: the project was temporarily changed to SPA/static output (`dist`) for Netlify, but the app is still a TanStack Start project with admin routes and backend-backed auth/data. That mismatch can make Netlify publish the wrong folder or miss the server/routing layer. The CMS being under `/admin` is not the core problem by itself; it can stay as a separate route. The problem is the Netlify build adapter/output configuration.

Plan:

1. Add the official Netlify adapter dependency
   - Install `@netlify/vite-plugin-tanstack-start` as a dev dependency.
   - This lets Netlify build the client and server parts correctly instead of treating the app like a plain static SPA.

2. Update `vite.config.ts` for Netlify SSR output
   - Remove the temporary `spa: { enabled: true }` configuration.
   - Add the Netlify TanStack Start plugin.
   - Keep the existing Lovable/TanStack setup compatible rather than duplicating plugins in a way that breaks the preview.
   - Ensure the config no longer forces the old Cloudflare/server wrapper path for Netlify.

3. Create `netlify.toml` in the project root
   - Add the Netlify build command and output folders:

```toml
[build]
  command = "bun run build"
  publish = ".output/public"

[functions]
  directory = ".output/server"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

4. Keep `public/_redirects` as a fallback only
   - It does not hurt static routing, but `netlify.toml` becomes the main Netlify configuration.

5. Verify the setup
   - Check that the final config is internally consistent: Netlify should use `bun run build`, publish the adapter output, and preserve `/admin` as a normal separate route.

After this, your Netlify settings should be:
- Build command: `bun run build`
- Publish directory: `.output/public`

No CMS split into another app is needed unless you specifically want a totally separate admin deployment later.