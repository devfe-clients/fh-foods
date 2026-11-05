import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: process.env['VERCEL'] ? 'vercel' : 'cloudflare-module',
  },
  vite: {
    build: {
      rollupOptions: {
        external: [
          'firebase-admin',
          '@google-cloud/firestore',
          'google-gax',
        ],
      },
    },
  },
});