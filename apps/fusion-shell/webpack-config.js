const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const {
  generateProxyConfigObject,
  generateSubAppsImportMap,
  generateImportMap,
} = require('./firebase-functions/proxy-config-utils');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const nodeEnv = process.env.NODE_ENV || 'production';
const isUsingFusionEnv =
  process.env.NX_TASK_TARGET_CONFIGURATION &&
  process.env.NX_TASK_TARGET_CONFIGURATION === 'fusion';

const useMockEnv =
  nodeEnv === 'mock' ||
  (process.env.NX_TASK_TARGET_CONFIGURATION &&
    process.env.NX_TASK_TARGET_CONFIGURATION === 'mock') ||
  isUsingFusionEnv;

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx({
    nx: {
      svgr: true,
    },
  }),
  withReact({
    nx: {
      svgr: true,
    },
  }),
  (config) => {
    const nodeEnv = process.env.NODE_ENV || 'production';
    const webpackConfigTarget =
      process.env.NX_TASK_TARGET_CONFIGURATION || 'development';

    console.log(
      `Custom webpack config(${webpackConfigTarget}, NODE_ENV: ${nodeEnv}) for fusion-shell was loaded...`
    );

    // To make the build work with both fusion and /cdf/ we need to set the baseHref and publicPath
    const publicPath =
      process.env.NX_TASK_TARGET_CONFIGURATION &&
      (process.env.NX_TASK_TARGET_CONFIGURATION === 'fusion' ||
        process.env.NX_TASK_TARGET_CONFIGURATION === 'fusion-dev' ||
        process.env.NX_TASK_TARGET_CONFIGURATION === 'fusion-next-release')
        ? '/'
        : '/cdf/';

    config.output = {
      ...config.output,
      publicPath: publicPath,
    };

    config.resolve.fallback = { path: require.resolve('path-browserify') };

    config.mode = nodeEnv === 'production' ? 'production' : 'development';
    // react scripts are causing a lot of errors to be throw in console (Failed to parse source map from...)
    // https://github.com/facebook/create-react-app/discussions/11767
    config.ignoreWarnings = [
      /Failed to parse source map/,
      /The code generator has deoptimised the styling/gim,
    ];

    if (config.devServer) {
      const coreDependenciesImportMap = JSON.parse(
        fs.readFileSync('./apps/fusion-shell/src/import-map.json', 'utf8')
      );

      const subAppsImportManifest = JSON.parse(
        fs.readFileSync(
          './apps/fusion-shell/src/environments/fusion/next-release/sub-apps-import-map.json',
          'utf8'
        )
      );

      // The idea is to configure the proxy to load the sub-apps from firebase
      // https://webpack.js.org/configuration/dev-server/#devserverproxy
      config.devServer.proxy = {
        ...generateProxyConfigObject(
          subAppsImportManifest,
          publicPath,
          useMockEnv
        ),
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
        devServer.app.get(`${publicPath}import-map.json`, (_, response) => {
          response.json(
            generateImportMap(coreDependenciesImportMap, publicPath)
          );
        });

        // The idea is to generate the sub-apps-import-map.json file on the fly
        // And load the sub-apps directly from firebase
        devServer.app.get(
          `${publicPath}sub-apps-import-map.json`,
          (_, response) => {
            response.json(
              generateSubAppsImportMap(subAppsImportManifest, publicPath)
            );
          }
        );
        return middlewares;
      };

      return config;
    }

    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: './firebase.json',
            to: path.resolve(__dirname, '../../dist/apps/fusion-shell'),
          },
        ],
      })
    );

    config.optimization.minimize = true;

    return config;
  }
);
