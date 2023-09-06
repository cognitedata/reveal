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
      `Custom webpack config(${nodeEnv}) for Data Exploration was loaded...`
    );

    config.resolve.fallback = { path: require.resolve('path-browserify') };

    if (nodeEnv === 'mock' || nodeEnv === 'development') {
      // add your own webpack tweaks if needed
      config.resolve.alias['@cognite/cdf-sdk-singleton'] = require.resolve(
        './src/mock/cogniteSdkSingleton.ts'
      );
    }

    config.module.rules = [
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ['@svgr/webpack'],
      },
      ...config.module.rules,
    ];

    return config;
  }
);
