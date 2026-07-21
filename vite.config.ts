import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",

      includeAssets: [
        "favicon.svg",
        "icons.svg",
      ],

      manifest: {
        name: "EMUSA Sumários",
        short_name: "EMUSA",
        description:
          "Gestão de sumários, presenças, alunos e horários da EMUSA.",

        start_url: "/",
        scope: "/",

        display: "standalone",
        orientation: "any",

        background_color: "#eef4ff",
        theme_color: "#2563eb",

        lang: "pt-PT",

        icons: [
          {
            src: "/icons.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icons.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        navigateFallback: "/index.html",

        globPatterns: [
          "**/*.{js,css,html,svg,png,ico,woff2}",
        ],

        cleanupOutdatedCaches: true,
      },
    }),
  ],
});