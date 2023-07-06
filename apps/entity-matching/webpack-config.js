const {
  withSingleSpa,
} = require('../../tools/webpack/single-spa-webpack-config');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

const nodeEnv = process.env.NODE_ENV || 'production';
const useMockEnv =
  nodeEnv === 'mock' ||
  (process.env.NX_TASK_TARGET_PROJECT &&
    process.env.NX_TASK_TARGET_PROJECT === 'entity-matching-e2e');

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx(),
  withReact(),
  withSingleSpa({ useMockEnv }),
  (config) => {
    const nodeEnv = process.env.NODE_ENV || 'production';
    console.log(
      `Custom webpack config(${nodeEnv}) for entity-matching was loaded...`
    );

    if (useMockEnv) {
      return config;
    }

    return config;
  }
);
