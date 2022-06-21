const { override } = require('customize-cra');

module.exports = {
  devServer: function (configFunction) {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);

      // Set loose allow origin header to prevent CORS issues (used for local-cdn case)
      config.headers = { 'Access-Control-Allow-Origin': '*' };
      return config;
    };
  },
  watchOptions: {
    aggregateTimeout: 2000
  }
};

const addIgnoreSourcemapsloaderWarnings = config => {
  config.ignoreWarnings = [
    // Ignore warnings raised by source-map-loader.
    // some third party packages may ship miss-configured sourcemaps, that interrupts the build
    // See: https://github.com/facebook/create-react-app/discussions/11278#discussioncomment-1780169
    /**
     * @param {import('webpack').WebpackError} warning
     * @returns {boolean}
     */
    function ignoreSourcemapsloaderWarnings(warning) {
      return (
        warning.module &&
        warning.module.resource.includes('node_modules') &&
        warning.details &&
        warning.details.includes('source-map-loader')
      );
    },
  ];
  return config;
};

module.exports = override(
  addIgnoreSourcemapsloaderWarnings
);
