const { override } = require('customize-cra');

module.exports = {
  devServer: function (configFunction) {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);

      // Removes deprecation warning
      if (process.env.HTTPS === undefined || process.env.HTTPS !== "false") {
        config.server = 'https';
      } else {
        config.server = 'http';
      }
      delete config.https;

      // Removes deprecation warning
      config.setupMiddlewares = (middleWares) => middleWares;
      delete config.onAfterSetupMiddleware;
      delete config.onBeforeSetupMiddleware;

      // Set loose allow origin header to prevent CORS issues (used for local-cdn case)
      config.headers = { 'Access-Control-Allow-Origin': '*' };
      return config;
    };
  },
  webpack: function (config) {
    return { ...config, ignoreWarnings: [/Failed to parse source map/] }
  },
  watchOptions: {
    aggregateTimeout: 2000,
  }
};
