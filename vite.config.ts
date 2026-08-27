// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Disable Nitro / Cloudflare so we get a pure static SPA build
  nitro: false,

  tanstackStart: {
    spa: {
      enabled: true,
    },
    server: { entry: "server" },
  },
});