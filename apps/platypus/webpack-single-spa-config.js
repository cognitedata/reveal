const {
  withSingleSpa,
} = require('../../tools/webpack/single-spa-webpack-config');
const { filterEnvVars } = require('../../tools/webpack/filter-env-vars');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

let nodeEnv = process.env.NODE_ENV || 'production';
const useMockEnv =
  nodeEnv === 'mock' ||
  (process.env.NX_TASK_TARGET_CONFIGURATION &&
    ['e2e', 'mockV3'].includes(process.env.NX_TASK_TARGET_CONFIGURATION));

module.exports = composePlugins(
  withNx(),
  withReact(),
  filterEnvVars(),
  withSingleSpa({ useMockEnv }),
  (config) => {
    if (process.env.NX_TASK_TARGET_CONFIGURATION === 'production') {
      nodeEnv = 'production';
    }
    // (config, { options, context }) - options and context are available here as well
    console.log(`Custom webpack config(${nodeEnv}) for Platypus was loaded...`);

    config.resolve.fallback = { path: require.resolve('path-browserify') };
    // This fixes the issue with the monaco editor not being able to load its web workers
    config.output.publicPath = '/';

    if (useMockEnv) {
      // add your own webpack tweaks if needed
      config.resolve.alias['@cognite/cdf-sdk-singleton'] = require.resolve(
        './src/environments/mock/cogniteSdkSingleton.ts'
      );

      config.mode = nodeEnv === 'production' ? 'production' : 'development';

      return {
        ...config,
        plugins: [
          ...config.plugins,
          new MonacoWebpackPlugin({
            publicPath: '/',
            languages: ['graphql'],
          }),
        ],
      };
    }

    config.output.filename = ({ chunk: { name } }) => {
      return name === 'main' || name === 'bootstrap'
        ? 'index.js'
        : '[name].[contenthash:8].js';
    };

    // This ensures Monaco is able to load its web workers
    config.plugins.push(
      new MonacoWebpackPlugin({ publicPath: '/', languages: ['graphql'] })
    );

    if (nodeEnv !== 'production') {
      delete config.optimization;
    }

    if (nodeEnv === 'production') {
      config.optimization.minimize = true;
    }
    config.mode = nodeEnv === 'production' ? 'production' : 'development';

    return config;
  }
);
