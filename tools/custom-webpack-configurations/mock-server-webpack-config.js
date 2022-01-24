const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');

// tools/custom-webpack-configurations/platypus-cli-webpack-config.js
module.exports = (config, context) => {
  const nodeEnv = process.env.NODE_ENV || 'production';
  if(config.optimization){
    config.optimization.minimize = (nodeEnv === "production");
  }
  return {
    ...config,
    mode: process.env.NODE_ENV || 'production',
    module: {
      ...config.module,
      parser: {
        ...config.module.parser,
          javascript: {
              // Enable magic comments, disable by default for perf reasons
              commonjsMagicComments: true
          }
      }
  },
    plugins: [
      ...config.plugins,
      new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
      new CopyPlugin({
        patterns: [
          {
            from: "apps/mock-server/**/*.md",
            to: "[name][ext]",
          },
        ]
      })
    ]
  };
};
