/// <reference types="vitest" />
import { writeFileSync } from 'fs';
import { resolve } from 'path';

import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import PrefixWrap from 'postcss-prefixwrap';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import macrosPlugin from 'vite-plugin-babel-macros';
import svgr from 'vite-plugin-svgr';
import viteTsConfigPaths from 'vite-tsconfig-paths';

// @ts-ignore
import { generateImportMap } from './scripts/generate-import-maps';
import { generateCSPHeader } from './scripts/http-headers-utils';
import { appManifests } from './src/appManifests';

const { FUSION_ENV } = process.env;

if (!FUSION_ENV) {
  throw new Error('Missing FUSION_ENV environment variable');
}

console.log(
  `
╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║ ➜ Use this for local development -> https://local.cognite.ai:4200/  ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
`
);

const transformHtmlPlugin = (data: Record<string, string>) => ({
  name: 'transform-html',
  transformIndexHtml(html: string) {
    return html.replace(/<%=\s*(\w+)\s*%>/gi, (_, p1) => data[p1] || '');
  },
});

const generateSubappImportMapsPlugin = () => ({
  name: 'generate-subapp-import-maps',
  configResolved() {
    const importMaps: Record<string, object> = {
      staging: generateImportMap('staging'),
      preview: generateImportMap('preview'),
      production: generateImportMap('production'),
    };
    const outputFolder = resolve(__dirname, 'public');
    const filePath = (env: string) =>
      resolve(outputFolder, `subapps-import-map-${env}.json`);
    for (const [env, importMap] of Object.entries(importMaps)) {
      writeFileSync(filePath(env), JSON.stringify(importMap, null, 2));
    }
    // create the default import map for local development
    writeFileSync(
      resolve(outputFolder, `subapps-import-map.json`),
      JSON.stringify(importMaps[FUSION_ENV], null, 2)
    );
  },
});

export default defineConfig({
  cacheDir: '../../node_modules/.vite/fusion',

  resolve: {
    dedupe: ['@cognite/plotting-components'],
    alias: {
      fs: require.resolve('rollup-plugin-node-builtins'),
    },
  },

  server: {
    port: 4200,
    host: '127.0.0.1',
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['../../'],
    },
    https: true,
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    basicSsl(),
    generateSubappImportMapsPlugin(),
    transformHtmlPlugin({
      CSP: generateCSPHeader(appManifests),
    }),
    svgr(),
    react({
      babel: {
        plugins: [
          [
            // Info: this plugin might silently fail if the format of the styled-components string interpolation css is not correct.
            '@quickbaseoss/babel-plugin-styled-components-css-namespace',
            { cssNamespace: '&&&' },
          ],
          [
            'babel-plugin-styled-components',
            {
              namespace: 'fusion-shell',
              fileName: false,
            },
          ],
        ],
      },
    }),
    viteTsConfigPaths({
      root: '../../',
    }),
    macrosPlugin(),
    visualizer(),
  ],

  define: {
    'process.platform': `'${process.platform}'`,
    ...Object.entries({
      ...loadEnv('development', process.cwd(), 'REACT_APP_'),
      ...loadEnv('development', process.cwd(), 'PUBLIC_URL'),
    }).reduce(
      (obj, [key, value]) => ({
        ...obj,
        [`process.env.${key}`]: JSON.stringify(value),
      }),
      {}
    ),
  },

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },

  css: {
    postcss: {
      plugins: [
        PrefixWrap(`.fusion-shell-style-scope`, {
          ignoredSelectors: [':root'],
        }),
      ],
    },
  },
});
