const {
  withSingleSpa,
} = require('../../tools/webpack/single-spa-webpack-config');
const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const nodeEnv = process.env.NODE_ENV || 'production';
const useMockEnv =
  nodeEnv === 'mock' ||
  (process.env.NX_TASK_TARGET_PROJECT &&
    process.env.NX_TASK_TARGET_PROJECT === 'functions-ui-e2e');

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx(),
  withReact(),
  withSingleSpa({ useMockEnv }),
  (config) => {

    
    const nodeEnv = process.env.NODE_ENV || 'production';
    console.log(
      `Custom webpack config(${nodeEnv}) for functions-ui was loaded...`
    );

    config.resolve.fallback = { path: require.resolve('path-browserify') };

    config.plugins.push(
      new MonacoWebpackPlugin({
        publicPath: '/',
        languages: ['python'],
      })
    );

    if (
      nodeEnv === 'mock' ||
      nodeEnv === 'development' ||
      (process.env.NX_TASK_TARGET_PROJECT &&
        process.env.NX_TASK_TARGET_PROJECT === 'platypus-e2e')
    ) {
      // add your own webpack tweaks if needed
      config.resolve.alias['@cognite/cdf-sdk-singleton'] = require.resolve(
        './src/mock/cogniteSdkSingleton.ts'
      );
    }

    if (useMockEnv) {
      return config;
    }

    return config;
  }
);
