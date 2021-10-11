const path = require('path');

module.exports = {
  stories: [
    '../src/**/*.stories.@(ts|tsx|mdx)',
    '../src/**/__stories__/*.stories.@(ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    // this stops build on errors:
    // '@storybook/preset-create-react-app',
    {
      name: '@storybook/addon-docs',
      options: { configureJSX: true },
    },
    '@storybook/addon-viewport/register',
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

    return config;
  },
};
