const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/preset-create-react-app', '@storybook/addon-knobs'],
  webpackFinal: async (config) => {
    config.resolve.extensions.push('.ts', '.tsx');
    config.resolve.modules = [
      ...(config.resolve.modules ?? []),
      path.resolve(__dirname, '../src/'),
      path.resolve(__dirname, '../src/__mocks__/'),
      path.resolve(__dirname, '../node_modules'),
    ];
    config.optimization.minimize = false;
    config.resolve.alias['@cognite/cdf-sdk-singleton'] = require.resolve(
      '../src/__mocks__/@cognite/cdf-sdk-singleton'
    );
    return config;
  },
};
