const {
  withSingleSpa,
} = require('../../tools/webpack/single-spa-webpack-config');
const { filterEnvVars } = require('../../tools/webpack/filter-env-vars');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const nodeEnv = process.env.NODE_ENV || 'production';
const useMockEnv = nodeEnv === 'mock';

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx(),
  withReact(),
  filterEnvVars(),
  withSingleSpa({ useMockEnv }),
  (config) => {
    const nodeEnv = process.env.NODE_ENV || 'production';
    console.log(`Custom webpack config(${nodeEnv}) for copilot was loaded...`);

    config.resolve.fallback = { path: require.resolve('path-browserify') };

    config.plugins.push(
      new MonacoWebpackPlugin({
        languages: ['python', 'json', 'graphql'],
      })
    );

    if (useMockEnv) {
      return config;
    }

    return config;
  }
);
