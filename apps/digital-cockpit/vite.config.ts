import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import macrosPlugin from 'vite-plugin-babel-macros';

export default defineConfig(({ command }) => {
  let env = {};
  if (command === 'serve') {
    env = {
      NODE_ENV: 'development',
      ...loadEnv('development', process.cwd(), 'REACT_APP_'),
      ...loadEnv('development', process.cwd(), 'PUBLIC_URL'),
    };
  } else {
    env = {
      NODE_ENV: 'production',
      ...loadEnv('production', process.cwd(), 'REACT_APP_'),
      ...loadEnv('production', process.cwd(), 'PUBLIC_URL'),
    };
  }
  return {
    plugins: [
      react(),
      tsConfigPaths({
        root: `${process.cwd()}/../..`,
        projects: ['tsconfig.json', 'apps/digital-cockpit/tsconfig.json'],
      }),
      svgr(),
      macrosPlugin(),
    ],
    base: command === 'build' ? '/PUBLIC_URL_VALUE' : '/',
    define: {
      'process.env': env,
    },
    build: {
      sourcemap: command === 'build',
      commonjsOptions: {
        include: [],
        exclude: [],
      },
    },
  };
});
