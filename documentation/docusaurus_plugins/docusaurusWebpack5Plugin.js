/*
 * Adapted from https://gist.github.com/sibelius/24f63eef7f43b15dc73c4a0be11bbef8
 */

const webpack = require('webpack');

module.exports = function (context, options) {
  return {
    name: 'docusaurus-webpack-plugin',
    // eslint-disable-next-line
    configureWebpack(config, isServer, utils) {
      return {
        plugins: [
          new webpack.DefinePlugin({
            'process.env': JSON.stringify({ })
          }),
        ]
      };
    },
  };
};
