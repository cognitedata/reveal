const { mockEnvProxyConfig } = require('./proxy-config-utils');
var fetch = require('node-fetch');

const {
  generateSubAppsImportMap,
  generateAppsRuntimeManifest,
} = require('./lib/import-map-utils');

function generateWebpackDevServerConfig(
  config,
  subAppsConfig,
  importMaps,
  importMapsEnv,
  publicPath,
  useMockApis = true
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

  config.devServer.proxy = {
    ...(useMockApis ? mockEnvProxyConfig : {}),
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

    appendLoginAppRoutes(devServer.app, importMaps);

    return middlewares;
  };
}

function appendLoginAppRoutes(app, importMaps) {
  // inject the login app in the import-map.json
  app.get(`/import-map.json`, function (req, res) {
    importMaps.imports[
      '@cognite/login-page'
    ] = `https://localhost:8080/apps/cdf-hub-login-page/index.js`;
    res.json(importMaps);
  });

  // download the script for login page from prod
  // we don't have the login app locally
  app.get('/apps/cdf-hub-login-page/index.js', function (req, res) {
    fetch('https://cog-demo.fusion.cognite.com/import-map.json')
      .then((res) => res.json())
      .then((fusionImportMaps) =>
        fetch(
          `https://cog-demo.fusion.cognite.com${fusionImportMaps.imports['@cognite/login-page']}`
        )
      )
      .then((res) => res.text())
      .then((text) => {
        res.set('Content-Type', 'application/javascript');
        res.send(text);
      });
  });
}

module.exports = {
  generateWebpackDevServerConfig,
  appendLoginAppRoutes,
};
