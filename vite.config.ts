import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname!, '.'),
      },
    },
    build: {
      target: 'es2022',
      cssMinify: true,
      chunkSizeWarningLimit: 1000,
      rolldownOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/three')) return 'three';
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/motion') ||
              id.includes('node_modules/lucide-react')
            ) return 'vendor';
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
