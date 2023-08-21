const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const { withModuleFederation } = require('@nx/react/module-federation');

const {
  generateWebpackDevServerConfig,
} = require('./tools/scripts/webpack-dev-server');

const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const coreLibraries = new Set([
  'react',
  'react-dom',
  'react-router-dom',
  '@fusion/load-remote-module',
]);

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
  withModuleFederation({
    name: 'fusion-shell',
    remotes: [], // using dynamic remotes, not needed here
    shared: (libraryName, defaultConfig) => {
      if (coreLibraries.has(libraryName)) {
        return {
          ...defaultConfig,
          eager: true,
        };
      }

      // Returning false means the library is not shared.
      return false;
    },
  }),
  (config) => {
    const nodeEnv = process.env.NODE_ENV || 'production';
    const webpackConfigTarget =
      process.env.NX_TASK_TARGET_CONFIGURATION || 'development';

    // for mock or dev, use staging, otherwise use the one from nx_task_target_configuration
    const importMapsEnv =
      webpackConfigTarget === 'mock' ||
      webpackConfigTarget === 'e2e' ||
      webpackConfigTarget === 'development'
        ? 'staging'
        : webpackConfigTarget;

    const publicPath = '/';
    const subAppsConfig = JSON.parse(
      fs.readFileSync('./apps/fusion-shell/src/apps-manifest.json', 'utf8')
    );

    const importMaps = JSON.parse(
      fs.readFileSync('./apps/fusion-shell/src/import-map.json', 'utf8')
    );

    console.log(
      `Custom webpack config(${webpackConfigTarget}, NODE_ENV: ${nodeEnv}, importMaps: ${importMapsEnv}) for fusion-shell was loaded...`
    );

    /**
     * Config overrides for the fusion-shell
     */

    // To make the build work with both fusion and /cdf/ we need to set the baseHref and publicPath
    config.output = {
      ...config.output,
      // publicPath,
    };

    if (nodeEnv === 'production') {
      config.optimization.minimize = true;
    }

    config.resolve.fallback = { path: require.resolve('path-browserify') };

    config.mode = nodeEnv === 'production' ? 'production' : 'development';
    // react scripts are causing a lot of errors to be throw in console (Failed to parse source map from...)
    // https://github.com/facebook/create-react-app/discussions/11767
    config.ignoreWarnings = [
      /Failed to parse source map/,
      /The code generator has deoptimised the styling/gim,
    ];

    // We need to generate this files when building the app
    if (!config.devServer) {
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
    }

    // For dev server, generate them on fly
    if (config.devServer) {
      let useMockApis = process.env.USE_MOCK_API === 'false' ? false : true;
      if (process.env.NX_TASK_TARGET_CONFIGURATION === 'e2e') {
        useMockApis = false;
      }

      console.log(`Using mock apis: ${useMockApis}`);

      generateWebpackDevServerConfig(
        config,
        subAppsConfig,
        importMaps,
        importMapsEnv,
        publicPath,
        useMockApis
      );
      return config;
    }

    return config;
  }
);
