module.exports = {
  devServer: function (configFunction) {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);

      // Set loose allow origin header to prevent CORS issues (used for local-cdn case)
      config.headers = { 'Access-Control-Allow-Origin': '*' };

      return config;
    };
  },
};
