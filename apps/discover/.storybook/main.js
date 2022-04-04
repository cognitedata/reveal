const path = require('path');
const webpack = require('webpack');

module.exports = {
  core: {
    builder: 'webpack5',
  },
  stories: [
    '../src/**/*.stories.@(ts|tsx|mdx)',
    '../src/**/__stories__/*.stories.@(ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    // this stops build on errors:
    // '@storybook/preset-create-react-app',

    // Causes an error with useNavigate in @storybook/router
    // {
    //   name: '@storybook/addon-docs',
    //   options: { configureJSX: true },
    // },
    // '@storybook/addon-viewport/register',
  ],
  typescript: {
    check: false, // type-check stories during Storybook build
    reactDocgen: 'none', // https://github.com/styleguidist/react-docgen-typescript/issues/356#issuecomment-850400428
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
