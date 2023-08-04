const SystemJSPublicPathPlugin = require('systemjs-webpack-interop/SystemJSPublicPathWebpackPlugin');
const webpack = require('webpack');

module.exports = (config) => {
  config.output = {
    ...config.output,
    filename: 'index.js',
    libraryTarget: 'system',
    uniqueName: 'cdf-sdk-singleton',
    devtoolNamespace: 'cdf-sdk-singleton',
    publicPath: '',
  };

  config.mode = 'production';
  config.optimization.minimize = true;
  config.externals = [];

  // Convert the lib as SystemJS library
  config.plugins.push(
    new SystemJSPublicPathPlugin({
      systemjsModuleName: `@cognite/cdf-sdk-singleton`,
      rootDirectoryLevel: config.rootDirectoryLevel,
    })
  );

  // with this webpack config, all your path and env variables
  // will end up in the output bundle.
  // filter out the DefinePlugin from the defaultConfig an inject empty env varialbes
  config.plugins = config.plugins.filter((plugin) => {
    if (plugin.constructor.name === 'DefinePlugin') {
      return false;
    }
    return true;
  });
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({ COGNITE_PROJECT: '' }),
    })
  );

  return config;
};
