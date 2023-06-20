const {
  withSingleSpa,
} = require('../../tools/webpack/single-spa-webpack-config');
const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');

const nodeEnv = process.env.NODE_ENV || 'production';
const useMockEnv = nodeEnv === 'mock';

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx(),
  withReact(),
  withSingleSpa({ useMockEnv }),
  (config) => {
    const nodeEnv = process.env.NODE_ENV || 'production';

    config.resolve.fallback = {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    };

    console.log(`Custom webpack config(${nodeEnv}) for iot-hub was loaded...`);

    if (useMockEnv) {
      return config;
    }

    return config;
  }
);
