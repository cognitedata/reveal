const {
  withSingleSpa,
} = require('../../tools/webpack/single-spa-webpack-config');
const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');

const nodeEnv = process.env.NODE_ENV || 'production';

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx(),
  withReact(),
  withSingleSpa({ useMockEnv: false }),
  (config) => {
    const nodeEnv = process.env.NODE_ENV || 'production';
    console.log(
      `Custom webpack config(${nodeEnv}) for cdf-industry-canvas was loaded...`
    );

    config.resolve.fallback = { path: require.resolve('path-browserify') };

    config.externals = {
      'single-spa': 'single-spa',
      '@cognite/cdf-sdk-singleton': '@cognite/cdf-sdk-singleton',
      '@cognite/cdf-route-tracker': '@cognite/cdf-route-tracker',
    };

    if (nodeEnv === 'development' && config.devServer) {
      config.devServer.allowedHosts = 'all';
      config.devServer.headers['Access-Control-Allow-Origin'] = '*';
      config.devServer.https = true;
      config.devServer.port = 3010;

      config.devServer.static = {
        watch: {
          followSymlinks: true,
        },
      };
    }

    return config;
  }
);
