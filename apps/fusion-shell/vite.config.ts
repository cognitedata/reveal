/// <reference types="vitest" />
import { writeFileSync } from 'fs';
import { resolve } from 'path';

import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
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

const importMapOverrides = [
  '<script src="/dependencies/import-map-overrides@1.14.6/dist/import-map-overrides.js"></script>',
  // indenting the rest to render nicely in the html output
  '    <script src="/dependencies/query-string@7.1.1/dist/query-string.js"></script>',
  '    <import-map-overrides-full show-when-local-storage="devtools" dev-libs></import-map-overrides-full>',
  '    <script src="/dev-setup.js"></script>',
].join('\n');

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
    return (
      html
        // the first replace it to handle scenarios
        // where the identifier is part of an html comment
        // and then we want to replace the whole comment
        .replace(/<!-- <%=\s*(\w+)\s*%> -->/gi, (_, p1) => data[p1] || '')
        // this scenario is to replace just the matching string
        .replace(/<%=\s*(\w+)\s*%>/gi, (_, p1) => data[p1] || '')
    );
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
      CDF_IMPORT_MAP_OVERRIDES:
        FUSION_ENV === 'staging' ? importMapOverrides : '',
    }),
    svgr(),
    react(),
    viteTsConfigPaths({
      root: '../../',
    }),
    macrosPlugin(),
    visualizer(),
  ],

  define: {
    'process.env': '({})',
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
});
