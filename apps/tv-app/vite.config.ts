import { defineConfig } from "vite";

export default defineConfig({
    server: {
        headers: {
            'Service-Worker-Allowed': '/',
            'Service-Worker': 'script',
        },
    },
    build: {
        target: 'esnext'
    },
    worker: {
        format: 'es',
  },
})