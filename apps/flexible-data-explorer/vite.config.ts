import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite';
import macrosPlugin from 'vite-plugin-babel-macros';
import svgr from 'vite-plugin-svgr';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig((configType) => {
  const NODE_ENV = configType.mode.toLowerCase();

  const env = {
    NODE_ENV: NODE_ENV,
    ...loadEnv(NODE_ENV, process.cwd(), 'REACT_APP_'),
    ...loadEnv(NODE_ENV, process.cwd(), 'PUBLIC_URL'),
  };

  return {
    cacheDir: '../../node_modules/.vite/flexible-data-explorer',

    resolve: {
      dedupe: ['@cognite/plotting-components'],
      alias: {
        fs: require.resolve('rollup-plugin-node-builtins'),
      },
    },

    server: {
      port: 3000,
      host: 'localhost',
      https: true,
      usePulling: true,
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd())],
      },
    },

    preview: {
      port: 4300,
      host: 'localhost',
    },
    // dont just blanket expose process.env, expose just the ones you need.
    // https://dev.to/whchi/how-to-use-processenv-in-vite-ho9
    define: Object.entries(env).reduce(
      (obj, [key, value]) => ({
        ...obj,
        [`process.env.${key}`]: JSON.stringify(value),
      }),
      {}
    ),

    plugins: [
      basicSsl(),
      svgr(),
      react(),
      viteTsConfigPaths({
        projects: ['../../tsconfig.base.json', './tsconfig.json'],
      }),
      macrosPlugin(),
    ],
  };
});
