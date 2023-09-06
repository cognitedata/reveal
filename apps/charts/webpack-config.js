const {
  withSingleSpa,
} = require('../../tools/webpack/single-spa-webpack-config');
const { filterEnvVars } = require('../../tools/webpack/filter-env-vars');
const { composePlugins, withNx } = require('@nrwl/webpack');

const nodeEnv = process.env.NODE_ENV || 'production';
const useMockEnv =
  nodeEnv === 'mock' ||
  nodeEnv === 'development' ||
  (process.env.NX_TASK_TARGET_PROJECT &&
    process.env.NX_TASK_TARGET_PROJECT === 'charts-e2e');

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx(),
  filterEnvVars(),
  withSingleSpa({ useMockEnv: false }),
  (config) => {
    const nodeEnv = process.env.NODE_ENV || 'production';
    console.log(`Custom webpack config(${nodeEnv}) for charts was loaded...`);

    config.resolve.fallback = { path: require.resolve('path-browserify') };
    if (useMockEnv) {
      return config;
    }

    return config;
  }
);
