/*!
 * Copyright 2026 Cognite AS
 */

import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import wasm from 'vite-plugin-wasm';
import pkg from './package.json' with { type: 'json' };
import dts from 'unplugin-dts/vite';

export default defineConfig(({ command }) => {
  return {
    root: '.',
    plugins: [dts({ tsconfigPath: './tsconfig.webpack.json' }), glsl(), wasm()],

    worker: {
      format: 'es',
      plugins: [wasm()]
    },

    build: {
      outDir: 'dist',
      rolldownOptions: {
        external: [...getDependencyMatchers(pkg.dependencies), ...getDependencyMatchers(pkg.peerDependencies)],
        output: {
          preserveModules: true,
          entryFileNames: '[name].js'
        }
      },
      lib: {
        entry: 'index.ts',
        formats: ['es']
      }
    }
  };
});

function getDependencyMatchers(deps: Record<string, string>) {
  return Object.keys(deps).map(dep => new RegExp(`^${dep}(?:/.+)?$`));
}
