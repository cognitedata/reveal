const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const { composePlugins } = require('@nx/webpack');
const { filterEnvVars } = require('../../tools/webpack/filter-env-vars');

// tools/custom-webpack-configurations/platypus-cli-webpack-config.js
module.exports = composePlugins(filterEnvVars(), (config, context) => {
  const nodeEnv = process.env.NODE_ENV || 'production';
  if (config.optimization) {
    config.optimization.minimize = nodeEnv === 'production';
  }

  console.log('Loading custom webpack config - ', nodeEnv);
  return {
    ...config,
    mode: process.env.NODE_ENV || 'production',
    plugins: [
      ...config.plugins,
      new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
      new CopyPlugin({
        patterns: [
          {
            from: './**/*.md',
            to: '[name][ext]',
          },
          {
            from: './**/codegen-static/js/*',
            to: 'js/[name][ext]',
          },
        ],
      }),
    ],
  };
});
