const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/preset-create-react-app', '@storybook/addon-interactions'],
  babel: async options => {
    options.plugins.push(['istanbul', {
      // provide include patterns if you like
      include: ['src/**'],
      // provide exclude patterns if you like
      exclude: ['**/*.d.ts', '**/*{.,-}{spec,stories,types}.{js,jsx,ts,tsx}']
    }]);
    return options;
  },
  // Since the upgrade to react-scripts v5, Storybook must be modified to use Webpack 5.
  // https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#webpack-5
  core: {
    builder: 'webpack5'
  },
  // Storybook does not recognize absolute import by itself.
  // ../__mocks__ is here because of cdf-sdk-singleton
  // https://github.com/storybookjs/storybook/issues/2704#issuecomment-357407742
  webpackFinal: async (config) => {
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, "../src"),
      path.resolve(__dirname, "../__mocks__"),
      'node_modules',
    ];

    return config;
  },
};
