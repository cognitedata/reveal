/* eslint-disable no-param-reassign */
const fs = require('fs');
const path = require('path');

const tsconfigPaths = require('vite-tsconfig-paths');
const macrosPlugin = require('vite-plugin-babel-macros');
const { loadEnv, mergeConfig } = require('vite');

function getLocalPackages(returnName) {
  const dir = fs.readdirSync(path.resolve(process.cwd(), '../../packages'), {
    withFileTypes: true,
  });
  return dir
    .filter((file) => file.isDirectory())
    .map((folder) => {
      if (returnName) {
        return `@cognite/${folder.name}`;
      }
      return new RegExp(`packages/${folder.name}`);
    });
}

module.exports = (appName, override) => {
  return {
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
          projects: ['tsconfig.json', `apps/${appName}/tsconfig.json`],
        }),
        macrosPlugin.default(),
      ];

      const NODE_ENV = configType.toLowerCase();
      const env = {
        NODE_ENV,
        ...loadEnv(NODE_ENV, process.cwd(), 'REACT_APP_'),
        ...loadEnv(NODE_ENV, process.cwd(), 'PUBLIC_URL'),
      };

      config.define = {
        'process.env': env,
      };

      config.optimizeDeps = {
        ...config.optimizeDeps,
        include: getLocalPackages(true),
      };

      config.build = {
        outDir: 'storybook-static-tmp/tmp',
        commonjsOptions: {
          include: [...getLocalPackages(false), /node_modules/],
        },
      };

      config.resolve = {
        ...config.resolve,
        alias: {
          'styled-components':
            'styled-components/dist/styled-components.browser.cjs.js',
          'i18next-chained-backend':
            'i18next-chained-backend/dist/cjs/i18nextChainedBackend.js',
        },
      };

      config = mergeConfig(config, override);

      return config;
    },
  };
};
