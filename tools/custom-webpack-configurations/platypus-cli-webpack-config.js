const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');

// tools/custom-webpack-configurations/platypus-cli-webpack-config.js
module.exports = (config, context) => {
  console.log(config.output.path);
  return {
    ...config,
    plugins: [
      ...config.plugins,
      new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
      new CopyPlugin({
        patterns: [
          {
            from: "apps/platypus-cdf-cli/**/*.md",
            to: "[name][ext]",
          },
        ]
      })
    ]
  };
};
