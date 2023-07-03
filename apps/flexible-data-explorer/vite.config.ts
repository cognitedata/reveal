import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite';
import macrosPlugin from 'vite-plugin-babel-macros';
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
    },

    server: {
      port: 3000,
      host: 'localhost',
      https: true,
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd())],
      },
    },

    preview: {
      port: 4300,
      host: 'localhost',
    },
    define: {
      'process.env': env,
    },

    plugins: [
      basicSsl(),
      react(),
      viteTsConfigPaths({
        projects: ['../../tsconfig.base.json', './tsconfig.json'],
      }),
      macrosPlugin(),
    ],
  };
});
