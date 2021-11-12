const CopyPlugin = require("copy-webpack-plugin");

// tools/custom-webpack-configurations/platypus-cli-webpack-config.js
module.exports = (config, context) => {
  console.log(config.output.path);
  return {
    ...config,
    plugins: [
      ...config.plugins,
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
