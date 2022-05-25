module.exports = {
  devServer: function (configFunction) {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);

      // Set loose allow origin header to prevent CORS issues (used for local-cdn case)
      config.headers = { 'Access-Control-Allow-Origin': '*' };

      // Add some delay to aggregate file changes and post build scripts
      config.watchOptions.aggregateTimeout = 2000;

      return config;
    };
  },
};
