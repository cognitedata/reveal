/*!
 * Copyright 2026 Cognite AS
 */

import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import wasm from 'vite-plugin-wasm';

export default defineConfig(({ command }) => {
  return {
    plugins: [glsl(), wasm()],

    // 5. Build Options
    build: {
      outDir: 'dist',
      lib: {
        entry: 'index.ts',
        formats: ['es']
      }
    }
  };
});
