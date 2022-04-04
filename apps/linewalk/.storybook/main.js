const path = require('path');
const webpack = require('webpack');

module.exports = {
  core: {
    builder: 'webpack5',
  },
  stories: ['../src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
  ],
  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: {
    check: true, // type-check stories during Storybook build
    reactDocgen: 'none', // https://github.com/styleguidist/react-docgen-typescript/issues/356
  },
  webpackFinal: async (config) => {
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, '../src'),
    ];

    // Upgrading to storybook 6.4.19 required this change
    config.plugins = config.plugins.map((plugin) => {
      if (plugin instanceof webpack.DefinePlugin) {
        plugin.definitions['process.env'] = JSON.stringify('{}');
      }

      return plugin;
    });

    return config;
  },
};
