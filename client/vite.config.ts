import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Issa Beauty Dashboard",
        short_name: "Issa Beauty",
        description: "A dashboard for managing Issa Beauty's website",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/icon_issa.png",
            sizes: "512x512 128x128 64x64 32x32 24x24 16x16",
            type: "image/png",
          },
        ],
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
});
