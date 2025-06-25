import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';
import { coverageConfigDefaults } from 'vitest/config';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    dts({ tsconfigPath: './tsconfig.build.json' }),
    externalizeDeps({
      devDeps: true
    })
  ],
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: '[name]',
      formats: ['es']
    },
    rollupOptions: {
      output: {
        preserveModules: true
      }
    },
    sourcemap: command === 'build'
  },
  test: {
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    environment: 'happy-dom',
    globals: true,
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../coverage/reveal-react-components',
      exclude: [
        ...coverageConfigDefaults.exclude,
        'src/**/*.spec.ts',
        'src/**/*.spec.tsx',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'stories/**'
      ]
    },
    // Need to add E5 modules as inlined dependencies to be able to import them in tests.
    server: {
      deps: {
        inline: [
          '@cognite/cogs-lab',
          '@cognite/cogs.js',
          '@cognite/cogs-core',
          '@mui',
          '@cognite/cogs-utils',
          'lodash'
        ]
      }
    }
  }
}));
