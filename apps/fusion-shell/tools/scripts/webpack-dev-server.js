const { mockEnvProxyConfig } = require('./proxy-config-utils');
const {
  generateSubAppsImportMap,
  generateAppsRuntimeManifest,
} = require('./lib/import-map-utils');

function generateWebpackDevServerConfig(
  config,
  subAppsConfig,
  importMapsEnv,
  publicPath
) {
  const subAppsImportMap = generateSubAppsImportMap(
    subAppsConfig,
    importMapsEnv
  );

  const subAppsRuntimeManifest = generateAppsRuntimeManifest(
    subAppsConfig,
    importMapsEnv
  );

  const { generateCSPHeader } = require('./lib/http-headers-utils');

  config.devServer.headers = {
    ...config.devServer.headers,
    'Content-Security-Policy': generateCSPHeader(subAppsConfig, importMapsEnv),
  };

  // The idea is to configure the proxy to load the sub-apps from firebase
  // https://webpack.js.org/configuration/dev-server/#devserverproxy
  config.devServer.proxy = {
    ...mockEnvProxyConfig,
    '/_api/login_info': {
      target:
        'https://app-login-configuration-lookup.cognite.ai/fusion-dev/cog-appdev',
      secure: false,
      changeOrigin: true,
      logLevel: 'error',
      pathRewrite: {
        '^/_api/login_info': '',
      },
    },
  };

  // https://webpack.js.org/configuration/dev-server/#devserversetupmiddlewares
  config.devServer.setupMiddlewares = (middlewares, devServer) => {
    if (!devServer) {
      throw new Error('webpack-dev-server is not defined');
    }

    // The idea is to generate the sub-apps-import-map.json file on the fly
    // And load the sub-apps directly from firebase
    devServer.app.get(
      `${publicPath}sub-apps-import-map.json`,
      (_, response) => {
        response.json(subAppsImportMap);
      }
    );

    // The idea is to generate the sub-apps-modules-config.json file on the fly
    // And load the sub-apps that are using module federation directly from firebase
    devServer.app.get(`${publicPath}apps-manifest.json`, (_, response) => {
      response.json(subAppsRuntimeManifest);
    });
    return middlewares;
  };
}

module.exports = {
  generateWebpackDevServerConfig,
};
