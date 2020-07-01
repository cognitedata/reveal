const CopyWebpackPlugin = require("copy-webpack-plugin");

const revealSource = "node_modules/@cognite/reveal";

module.exports = function override(config) {
  if (!config.plugins) {
    // eslint-disable-next-line no-param-reassign
    config.plugins = [];
  }

  // that's for 6.x version of webpack-copy-plugin
  // if you use 5.x just put content of patterns into constructor
  // new CopyWebpackPlugin([ /* { from, to } */ ])
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: `${revealSource}/**/*.worker.js`,
          to: ".",
          flatten: true,
        },
        {
          from: `${revealSource}/**/*.wasm`,
          to: ".",
          flatten: true,
        },
      ],
    })
  );

  return config;
};
