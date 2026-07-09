import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Dev-only: port of the standalone backend the /api proxy targets. The
  // backend runs on 5002 (see issa-beauty-backend/.env); override with PORT if needed.
  const PORT = env.PORT ? parseInt(env.PORT) : 5002;
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        // Icons live in public/ and are generated from the navbar logo mark
        // (white on navy) — see the icon set installed alongside index.html.
        includeAssets: ["apple-touch-icon.png", "icon_issa.png"],
        manifest: {
          id: "issa_beauty-374336",
          name: "Issa Beauty Dashboard",
          short_name: "Issa Beauty",
          description: "A dashboard for managing Issa Beauty's website",
          start_url: "/",
          scope: "/",
          lang: "en",
          // Accent WebAPK splash: brand navy fills the launch screen with the
          // (matching-tile) logo centered. The runtime <meta name="theme-color">
          // takes over the status bar once the app loads.
          theme_color: "#0f172a",
          background_color: "#0f172a",
          display: "standalone",
          display_override: ["window-controls-overlay", "standalone"],
          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/maskable-icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "/maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          // Cross-origin API (api.issabeauty.org) must never be served from the
          // navigation fallback; only same-origin SPA routes fall back to the shell.
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:" + PORT,
          changeOrigin: true,
        },
      },
    },
  };
});
