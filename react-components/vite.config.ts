import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'] }),
    externalizeDeps({
      devDeps: true
    })
  ],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Reveal react components',
      // the proper extensions will be added
      fileName: 'index',
      formats: ['es']
    }
  }
});
