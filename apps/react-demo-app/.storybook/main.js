const tsconfigPaths = require('vite-tsconfig-paths');
const macrosPlugin = require('vite-plugin-babel-macros');
const { glob } = require('glob');
const path = require('path');
const { loadEnv } = require('vite');

const pathToNodeModules = path.normalize(
  `${process.cwd()}/../../../../../node_modules`
);
const coreJsFiles = glob
  .sync(`${pathToNodeModules}/core-js/modules/*.js`)
  .map((it) => {
    // Add 1 for trailing '/'
    const t = it.substring(pathToNodeModules.length + 1);
    return t;
  });

module.exports = {
  framework: '@storybook/react',
  core: { builder: '@storybook/builder-vite' },
  stories: ['../src/**/*.stories.tsx'],
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
        projects: ['tsconfig.json', 'apps/react-demo-app/tsconfig.json'],
      }),
      macrosPlugin.default(),
    ];
    const plugins = config.plugins.filter(
      (plugin) => plugin.name !== 'mock-core-js'
    );
    config.plugins = plugins;
    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: coreJsFiles,
    };

    const NODE_ENV = configType.toLowerCase();
    const env = {
      NODE_ENV: NODE_ENV,
      ...loadEnv(NODE_ENV, process.cwd(), 'REACT_APP_'),
      ...loadEnv(NODE_ENV, process.cwd(), 'PUBLIC_URL'),
    };

    config.define = {
      'process.env': env,
    };
    config.build = {
      // sourcemap: true,
      outDir: 'storybook-static-tmp/tmp',
      commonjsOptions: {
        include: [],
      },
    };
    return config;
  },
};
