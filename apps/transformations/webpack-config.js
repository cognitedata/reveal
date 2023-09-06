const {
  withSingleSpa,
} = require('../../tools/webpack/single-spa-webpack-config');
const { filterEnvVars } = require('../../tools/webpack/filter-env-vars');
const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(
  withNx(),
  filterEnvVars(),
  withSingleSpa({ useMockEnv: false }),
  (config) => {
    const nodeEnv = process.env.NODE_ENV || 'production';
    console.log(
      `Custom webpack config(${nodeEnv}) for transformations was loaded...`
    );

    config.resolve.mainFields = ['browser', 'module', 'main'];
    config.resolve.fallback = { path: require.resolve('path-browserify') };

    if (nodeEnv !== 'development') {
      config.optimization.minimize = true;
    }

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

    return config;
  }
);
