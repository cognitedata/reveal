const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');
const path = require('path');

// tools/custom-webpack-configurations/platypus-cli-webpack-config.js
module.exports = (config, context) => {
  const nodeEnv = process.env.NODE_ENV || 'production';
  if (config.optimization) {
    config.optimization.minimize = (nodeEnv === "production");
  }
  return {
    ...config,
    entry: {
      ...config.entry,
    },
    output: {
      ...config.output,
      filename: '[name].js'
    },
    mode: process.env.NODE_ENV || 'production',
    plugins: [
      ...config.plugins,
      new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
      new CopyPlugin({
        patterns: [
          {
            from: "apps/platypus-cdf-cli/*.md",
            to: "[name][ext]",
          },
          {
            from: "apps/platypus-cdf-cli/**/codegen-static/python/*",
            to: "python/[name][ext]",
          },
          {
            from: "apps/platypus-cdf-cli/**/codegen-static/js/*",
            to: "js/[name][ext]",
          }
        ]
      })
    ]
  };
};
