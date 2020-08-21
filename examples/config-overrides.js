const CopyWebpackPlugin = require("copy-webpack-plugin");

const revealSource = "node_modules/@cognite/reveal";

module.exports = {
  webpack: function(config) {
    if (!config.plugins) {
      // eslint-disable-next-line no-param-reassign
      config.plugins = [];
    }

    // todo: set worker-custom-folder as copying path to make it explicit
    // that's for 6.x version of webpack-copy-plugin
    // if you use 5.x just put content of patterns into constructor
    // new CopyWebpackPlugin([ /* { from, to } */ ])
    // config.plugins.push(
    //   new CopyWebpackPlugin({
    //     patterns: [
    //       {
    //         from: `${revealSource}/**/*.worker.js`,
    //         to: ".",
    //         flatten: true,
    //       },
    //       {
    //         from: `${revealSource}/**/*.wasm`,
    //         to: ".",
    //         flatten: true,
    //       },
    //     ],
    //   })
    // );

    return config;
  },

  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);

      // Set loose allow origin header to prevent CORS issues
      config.headers = {'Access-Control-Allow-Origin': '*'}

      return config;
    };
  },

};
