import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // IMPORTANT: disable Cloudflare (Lovable default) so it works on Vercel
  cloudflare: false,

  tanstackStart: {
    spa: {
      enabled: true,
    },
    server: { entry: "server" },
  },
});