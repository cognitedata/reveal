import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import macrosPlugin from 'vite-plugin-babel-macros';
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
    macrosPlugin(),
  ],
  // Manually export every env variable in process.env, until we can fully migrate to use import.meta.env
  define: {
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
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
