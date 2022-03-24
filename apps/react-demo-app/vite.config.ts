// import path from 'path';

// const { defineConfig } = require('vite');
// const react = require('@vitejs/plugin-react');
// const tsconfigPaths = require('vite-tsconfig-paths');
// const svgr = require('vite-plugin-svgr');
// const polyfillNode = require('rollup-plugin-polyfill-node');
// const inject = require('@rollup/plugin-inject');
// const { viteCommonjs } = require('@originjs/vite-plugin-commonjs');
// const macrosPlugin = require('vite-plugin-babel-macros');
// const commonjs = require('rollup-plugin-commonjs');

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import macrosPlugin from 'vite-plugin-babel-macros';
// import polyfillNode from 'rollup-plugin-polyfill-node';
import inject from '@rollup/plugin-inject';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsConfigPaths({
      root: `${process.cwd()}/../..`,
      projects: ['tsconfig.json', 'apps/react-demo-app/tsconfig.json'],
    }),
    svgr(),
    // polyfillNode(),
    macrosPlugin(),
  ],
  // Manually export every env variable in process.env, until we can fully migrate to use import.meta.env
  define: {
    'process.env.REACT_APP_SENTRY_DSN': JSON.stringify(
      process.env.REACT_APP_SENTRY_DSN
    ),
    'process.env.REACT_APP_MIXPANEL_TOKEN': JSON.stringify(
      process.env.REACT_APP_MIXPANEL_TOKEN
    ),
    'process.env.REACT_APP_LOCIZE_PROJECT_ID': JSON.stringify(
      process.env.REACT_APP_LOCIZE_PROJECT_ID
    ),
    'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL),
    'process.env.REACT_APP_APP_ID': JSON.stringify(
      process.env.REACT_APP_APP_ID
    ),
    'process.env.REACT_APP_ENV': JSON.stringify(process.env.REACT_APP_ENV),
    'process.env.REACT_APP_RELEASE_ID': JSON.stringify(
      process.env.REACT_APP_RELEASE_ID
    ),
    'process.env.REACT_APP_VERSION_NAME': JSON.stringify(
      process.env.REACT_APP_VERSION_NAME
    ),
    'process.env.REACT_APP_VERSION_SHA': JSON.stringify(
      process.env.REACT_APP_VERSION_SHA
    ),
    'process.env.INLINE_RUNTIME_CHUNK': JSON.stringify(
      process.env.INLINE_RUNTIME_CHUNK
    ),
    'process.env.HTTPS': JSON.stringify(process.env.HTTPS),
    'process.env.REACT_APP_I18N_DEBUG': JSON.stringify(
      process.env.REACT_APP_I18N_DEBUG
    ),
    'process.env.REACT_APP_I18N_PSEUDO': JSON.stringify(
      process.env.REACT_APP_I18N_PSEUDO
    ),
    'process.env.REACT_APP_LANGUAGE': JSON.stringify(
      process.env.REACT_APP_LANGUAGE
    ),
    'process.env.REACT_APP_LOCIZE_API_KEY': JSON.stringify(
      process.env.REACT_APP_LOCIZE_API_KEY
    ),
    'process.env.REACT_APP_LOCIZE_VERSION': JSON.stringify(
      process.env.REACT_APP_LOCIZE_VERSION
    ),
    'process.env.REACT_APP_MIXPANEL_DEBUG': JSON.stringify(
      process.env.REACT_APP_MIXPANEL_DEBUG
    ),
  },
  // 'process.env': {},
  // 'process.emitWarning': () => {},
  // 'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  // 'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
  build: {
    // sourcemap: true,
    commonjsOptions: {
      include: [],
    },
    rollupOptions: {
      plugins: [
        inject({
          Buffer: ['buffer', 'Buffer'],
          process: 'process',
        }),
      ],
    },
  },
});
