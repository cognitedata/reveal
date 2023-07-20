const SystemJSPublicPathPlugin = require('systemjs-webpack-interop/SystemJSPublicPathWebpackPlugin');
const webpack = require('webpack');

module.exports = (config) => {
  config.mode = 'production';
  config.output = {
    ...config.output,
    filename: 'index.js',
    libraryTarget: 'system',
    uniqueName: 'cdf-route-tracker',
    devtoolNamespace: 'cdf-route-tracker',
    publicPath: '',
  };
  config.optimization.minimize = true;
  config.externals = ['@cognite/cdf-sdk-singleton', 'react', 'react-dom'];

  config.plugins.push(
    new SystemJSPublicPathPlugin({
      systemjsModuleName: `@cognite/cdf-route-tracker`,
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
      'process.env': JSON.stringify({
        COGNITE_PROJECT: 'fusion',
        REACT_APP_ENV: 'production',
        REACT_APP_RELEASE_ID: '',
        REACT_APP_APP_ID: 'fusion',
        REACT_APP_VERSION_NAME: '',
        REACT_APP_DEBUG_METRICS: 'false',
      }),
    })
  );
  return config;
};
