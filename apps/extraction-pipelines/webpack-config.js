const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const {
  withSingleSpa,
} = require('../../tools/webpack/single-spa-webpack-config');
const { filterEnvVars } = require('../../tools/webpack/filter-env-vars');

module.exports = composePlugins(
  withNx(),
  withReact(),
  filterEnvVars(),
  withSingleSpa({ useMockEnv: false }),
  (config) => {
    const nodeEnv = process.env.NODE_ENV || 'production';
    console.log(
      `Custom webpack config(${nodeEnv}) for Extraction Pipelines was loaded...`
    );

    config.resolve.mainFields = ['browser', 'module', 'main'];
    config.resolve.fallback = { path: require.resolve('path-browserify') };

    if (nodeEnv === 'development' && config.devServer) {
      // Temp fix to devserver and hmr
      config.devServer.allowedHosts = 'all';
      config.devServer.headers['Access-Control-Allow-Origin'] = '*';
      config.devServer.https = true;
      config.devServer.port = 3033;

      config.devServer.static = {
        watch: {
          followSymlinks: true,
        },
      };
    }

    return config;
  }
);
