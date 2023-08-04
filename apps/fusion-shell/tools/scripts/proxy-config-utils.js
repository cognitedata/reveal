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
  '/reset': {
    target: 'http://localhost:4002',
    secure: false,
    changeOrigin: true,
    logLevel: 'error',
  },
};

/**
 * Generates the middlewares needed for the http-proxy-middleware.
 * @param {*} app The express app
 * @param {*} subAppsImportManifest The apps-manifest.json file in fusion-shell/src folder
 * @param {*} baseHref The base href for the sub-apps. Usually /cdf/
 * @param {*} useMockEnv If true, the proxy will be configured to use the mock environment.
 */
function generateMiddlewares(app) {
  for (const key in mockEnvProxyConfig) {
    app.use(key, createProxyMiddleware(mockEnvProxyConfig[key]));
  }
}

module.exports = {
  generateMiddlewares,
  mockEnvProxyConfig,
};
