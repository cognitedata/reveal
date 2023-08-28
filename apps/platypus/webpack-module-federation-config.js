const { composePlugins, withNx } = require('@nrwl/webpack');
const { withModuleFederation } = require('@nrwl/react/module-federation');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const { withReact } = require('@nrwl/react');
const CopyPlugin = require('copy-webpack-plugin');

const bundledLibraries = [
  '@cognite/cdf-sdk-singleton',
  'react-table',
  'oidc-client-ts',
  'd3-array',
  '@auth0/auth0-spa-js',
];

module.exports = composePlugins(
  withNx(),
  withReact(),
  withModuleFederation({
    name: 'platypus',
    exposes: {
      './Module': './src/remote-entry.ts',
    },
    shared: (libraryName, defaultConfig) => {
      if (bundledLibraries.includes(libraryName)) {
        return false;
      }

      return defaultConfig;
    },
  }),
  (config) => {
    console.log(
      'Module federation webpack config was loaded (' +
        process.env.NODE_ENV +
        ')'
    );
    config.context = __dirname;
    // add your own webpack tweaks if needed
    // config.resolve.alias['@cognite/cdf-sdk-singleton'] = require.resolve(
    //   './src/environments/mock/cogniteSdkSingleton.ts'
    // );
    config.resolve.fallback = { path: require.resolve('path-browserify') };
    // config.optimization.sideEffects = true;
    config.optimization.minimize = true;

    return {
      ...config,
      plugins: [
        ...config.plugins,
        new MonacoWebpackPlugin({
          publicPath: '/',
          languages: ['graphql'],
        }),
      ],
      // react scripts are causing a lot of errors to be throw in console (Failed to parse source map from...)
      // https://github.com/facebook/create-react-app/discussions/11767
      ignoreWarnings: [/Failed to parse source map/],
    };
  }
);
