const {
  withSingleSpa,
} = require('../../tools/webpack/single-spa-webpack-config');
const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(
  withNx(),
  withSingleSpa({ useMockEnv: false }),
  (config) => {
    const nodeEnv = process.env.NODE_ENV || 'production';
    console.log(
      `Custom webpack config(${nodeEnv}) for Data Exploration was loaded...`
    );

    config.resolve.fallback = { path: require.resolve('path-browserify') };

    if (nodeEnv === 'mock' || nodeEnv === 'development') {
      // add your own webpack tweaks if needed
      config.resolve.alias['@cognite/cdf-sdk-singleton'] = require.resolve(
        './src/mock/cogniteSdkSingleton.ts'
      );
    }

    if (nodeEnv === 'development' && config.devServer) {
      // Temp fix to devserver and hmr
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

    config.experiments = {
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };

    return config;
  }
);
