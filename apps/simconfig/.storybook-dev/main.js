const tsconfigPaths = require('vite-tsconfig-paths');
const NodeGlobalsPolyfillPlugin = require('@esbuild-plugins/node-globals-polyfill');
const macrosPlugin = require('vite-plugin-babel-macros');
const { loadEnv } = require('vite');

module.exports = {
  framework: '@storybook/react',
  core: { builder: '@storybook/builder-vite' },
  stories: ['../src/stories/*.stories.@(tsx|mdx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: {
    check: true, // type-check stories during Storybook build
    reactDocgen: 'none', // https://github.com/styleguidist/react-docgen-typescript/issues/356
  },
  viteFinal(config, { configType }) {
    config.plugins = [
      ...config.plugins,
      tsconfigPaths.default({
        root: `${process.cwd()}/../..`,
        projects: ['tsconfig.json', 'apps/simconfig/tsconfig.json'],
      }),
      macrosPlugin.default(),
    ];

    const NODE_ENV = configType.toLowerCase();
    const env = {
      NODE_ENV: NODE_ENV,
      ...loadEnv(NODE_ENV, process.cwd(), 'REACT_APP_'),
      ...loadEnv(NODE_ENV, process.cwd(), 'PUBLIC_URL'),
    };

    config.define = {
      'process.env': env,
    };
    config.resolve = {
      ...config.resolve,
      dedupe: ['@storybook/client-api'],
      alias: {
        ...config.alias,
        crypto: require.resolve('rollup-plugin-node-builtins'),
        path: require.resolve('path-browserify'),
      },
    };
    config.optimizeDeps = {
      ...config.optimizeDeps,
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis',
        },
        // Enable esbuild polyfill plugins
        plugins: [
          NodeGlobalsPolyfillPlugin.default({
            buffer: true,
          }),
        ],
      },
    };
    return config;
  },
};
