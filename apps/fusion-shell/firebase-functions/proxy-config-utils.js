const { createProxyMiddleware } = require('http-proxy-middleware');

const mockEnvProxyConfig = {
  '/login/status': {
    target: 'http://localhost:4002',
    secure: false,
    changeOrigin: true,
    logLevel: 'error',
  },
  '/api/v1/token/inspect': {
    target: 'http://localhost:4002',
    secure: false,
    changeOrigin: true,
    logLevel: 'error',
  },
  '/api': {
    target: 'http://localhost:4002',
    secure: false,
    changeOrigin: true,
    logLevel: 'error',
  },
  // '/_api/login_info': {
  //   target:
  //     'https://app-login-configuration-lookup.cognite.ai/fusion/cog-appdev',
  //   secure: false,
  //   changeOrigin: true,
  //   logLevel: 'error',
  //   pathRewrite: {
  //     '^/_api/login_info': '',
  //   },
  // },
  '/reset': {
    target: 'http://localhost:4002',
    secure: false,
    changeOrigin: true,
    logLevel: 'error',
  },
};

function generateSubAppImportPath(subAppKey, baseHref = '/cdf/') {
  return `${baseHref}apps/${subAppKey}`;
}

function generateHttpProxyMiddlewareConfig(
  subAppKey,
  subAppConfig,
  baseHref = '/cdf/'
) {
  const pathRewrite = {};
  pathRewrite[`^${generateSubAppImportPath(subAppKey, baseHref)}`] = '';
  const config = {
    target: `https://${subAppConfig.firebaseSite}.web.app`,
    secure: false,
    changeOrigin: true,
    logLevel: 'info',
    pathRewrite,
    onProxyRes: function (proxyRes, req) {
      if (
        req.originalUrl.startsWith('/cdf/apps/') &&
        req.originalUrl.endsWith('/index.js')
      ) {
        proxyRes.headers['cache-control'] =
          'max-age=0, no-cache, no-store, must-revalidate';
        proxyRes.headers['pragma'] = 'no-cache';
        proxyRes.headers['x-content-type-options'] = 'nosniff';
        proxyRes.headers['x-app'] = 'proxy';
        delete proxyRes.headers['Etag'];
      }
    },
  };
  return config;
}

/**
 * Generates the middlewares needed for the http-proxy-middleware.
 * @param {*} app The express app
 * @param {*} subAppsImportManifest The sub-apps-import-map.json file in fusion-shell/src folder
 * @param {*} baseHref The base href for the sub-apps. Usually /cdf/
 * @param {*} useMockEnv If true, the proxy will be configured to use the mock environment.
 */
function generateMiddlewares(
  app,
  subAppsImportManifest,
  baseHref = '/cdf/',
  useMockEnv = false
) {
  if (useMockEnv) {
    for (const key in mockEnvProxyConfig) {
      app.use(key, createProxyMiddleware(mockEnvProxyConfig[key]));
    }
  }

  for (const subAppKey in subAppsImportManifest.importMapConfig) {
    const subAppConfig = subAppsImportManifest.importMapConfig[subAppKey];
    const proxyPath = `${generateSubAppImportPath(subAppKey, baseHref)}`;
    if (subAppConfig.firebaseSite) {
      app.use(
        proxyPath,
        createProxyMiddleware(
          generateHttpProxyMiddlewareConfig(subAppKey, subAppConfig, baseHref)
        )
      );
    }
  }
}

/**
 * Generates The Proxy config needed for webpack-dev-server proxy.
 * https://webpack.js.org/configuration/dev-server/#devserverproxy
 *
 * Maps each subapp from subAppsImportManifest to the firebase hosting url.
 * The URL usually is https://<firebase-project-name>.web.app ex: https://cdf-data-catalog-staging.web.app
 *
 * Example:
 * {
 *    "/cdf/apps/cdf-data-catalog": {
 *      "target": "https://cdf-data-catalog-staging.web.app",
 *      "secure": false,
 *      "changeOrigin": true,
 *      "logLevel": "info"
 *  }
 * }
 *
 * @param {*} subAppsImportManifest
 * @param {*} useMockEnv
 * @returns
 */
function generateProxyConfigObject(
  subAppsImportManifest,
  baseHref = '/cdf/',
  useMockEnv = false
) {
  let proxyConfig = {};

  for (const subAppKey in subAppsImportManifest.importMapConfig) {
    const subAppConfig = subAppsImportManifest.importMapConfig[subAppKey];
    // Create proxy only for sites that are in firebase. All other sites are either deprecated or experimental and not deployed to firebase.
    // Map each sub-app to interal firebase hosting url.
    // The URL usually is https://<firebase-project-name>.web.app ex: https://cdf-data-catalog-staging.web.app
    if (subAppConfig.firebaseSite) {
      proxyConfig[generateSubAppImportPath(subAppKey, baseHref)] =
        generateHttpProxyMiddlewareConfig(subAppKey, subAppConfig, baseHref);
    }
  }

  if (useMockEnv) {
    proxyConfig = Object.assign(proxyConfig, mockEnvProxyConfig);
  }
  return proxyConfig;
}

/**
 * subAppsImportManifest is the sub-apps-import-map.json file in fusion-shell/src folder
 * Generates JSON object with the following structure:
 * {
 *  imports: {
 *   <sub-app-name>: <baseHref>/apps/<application-name>/index.js
 *  }
 * }
 *
 * Example:
 * {
 *  imports: {
 *    "@cognite/cdf-data-catalog": "/apps/cdf-data-catalog/index.js",
 *  }
 * }
 * @param {*} subAppsImportManifest
 * @returns
 */
function generateSubAppsImportMap(subAppsImportManifest, baseHref = '/cdf/') {
  const subAppsImportMap = {};

  for (const subAppKey in subAppsImportManifest.importMapConfig) {
    const subAppConfig = subAppsImportManifest.importMapConfig[subAppKey];
    // Map to the proxy url for each sub-app.
    subAppsImportMap[subAppConfig.resolveToKey] =
      generateSubAppImportPath(subAppKey, baseHref) + '/index.js';
  }

  return {
    imports: subAppsImportMap,
  };
}

function generateImportMap(importMapPaths, baseHref = '/cdf/') {
  const importMap = {};
  for (const key in importMapPaths.imports) {
    // Map to the proxy url for each sub-app.
    importMap[key] =
      baseHref + importMapPaths.imports[key].replace('/cdf/', '');
  }
  return {
    imports: importMap,
  };
}
module.exports = {
  generateMiddlewares,
  generateProxyConfigObject,
  generateSubAppsImportMap,
  generateImportMap,
};
