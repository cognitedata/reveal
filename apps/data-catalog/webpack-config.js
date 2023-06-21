const {
  withSingleSpa,
} = require('../../tools/webpack/single-spa-webpack-config');
const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');

const nodeEnv = process.env.NODE_ENV || 'production';
const useMockEnv =
  nodeEnv === 'mock' ||
  (process.env.NX_TASK_TARGET_PROJECT &&
    process.env.NX_TASK_TARGET_PROJECT === 'data-catalog-e2e');

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx({
    nx: {
      svgr: true,
    },
  }),
  withReact({
    nx: {
      svgr: true,
    },
  }),
  withSingleSpa({ useMockEnv }),
  (config) => {
    const nodeEnv = process.env.NODE_ENV || 'production';
    console.log(
      `Custom webpack config(${nodeEnv}) for data-catalog was loaded...`
    );

    if (useMockEnv) {
      return config;
    }

    return config;
  }
);
