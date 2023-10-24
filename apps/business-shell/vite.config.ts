/// <reference types="vitest" />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite';
import macrosPlugin from 'vite-plugin-babel-macros';
import svgr from 'vite-plugin-svgr';

export default defineConfig((configType) => {
  const NODE_ENV = configType.mode.toLowerCase();

  const env = {
    NODE_ENV: NODE_ENV,
    ...loadEnv(NODE_ENV, process.cwd(), 'REACT_APP_'),
    ...loadEnv(NODE_ENV, process.cwd(), 'PUBLIC_URL'),
  };

  return {
    cacheDir: '../../node_modules/.vite/business-shell',

    resolve: {
      dedupe: [
        '@cognite/plotting-components',
        '@cognite/cdf-i18n-utils',
        '@cognite/cdf-utilities',
      ],
      alias: {
        fs: require.resolve('rollup-plugin-node-builtins'),
      },
    },

    server: {
      port: 3000,
      host: 'localhost',
      https: true,
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd())],
      },
    },
    // dont just blanket expose process.env, expose just the ones you need.
    // https://dev.to/whchi/how-to-use-processenv-in-vite-ho9
    define: {
      'process.platform': `'${process.platform}'`,
      ...Object.entries(env).reduce(
        (obj, [key, value]) => ({
          ...obj,
          [`process.env.${key}`]: JSON.stringify(value),
        }),
        {}
      ),
    },

    preview: {
      port: 4300,
      host: 'localhost',
    },

    plugins: [basicSsl(), svgr(), react(), nxViteTsPaths(), macrosPlugin()],
  };
});
