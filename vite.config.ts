import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: process.env['VERCEL'] ? 'vercel-node' : 'node-server',
    // externals removido — vercel-node resolve firebase-admin nativamente
  },
});