import { resolve } from 'path';
import { type PluginOption, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';
import { exec } from 'node:child_process';

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      react(),
      dts({ include: ['src'] }),
      externalizeDeps({
        devDeps: true
      }),
      yalcPush()
    ],
    build: {
      lib: {
        // Could also be a dictionary or array of multiple entry points
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'Reveal react components',
        // the proper extensions will be added
        fileName: 'index',
        formats: ['es']
      },
      sourcemap: command === 'build'
    },
    test: {
      include: ['tests/unit-tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
      // Need to add E5 modules to be loaded as inlined dependencies to be able to import them in tests.
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
  };
});

function yalcPush(): PluginOption {
  if (process.env.YALC !== 'true') {
    return false;
  }
  return {
    name: 'yalc-push',
    closeBundle: async () => {
      await new Promise<void>((resolve, reject) => {
        const process = exec('yalc push');
        process.stdout
          ?.on('data', (data) => {
            console.log(data);
          })
          .on('error', (err) => {
            reject(err);
          })
          .on('close', () => {
            resolve();
          });
      });
    }
  };
}
