const rootMain = require('../../../.storybook/main');

module.exports = {
  ...rootMain,

  stories: [
    '../src/app/**/*.stories.mdx',
    '../src/app/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    ...rootMain.addons,
    '@storybook/addon-essentials',
    '@nx/react/plugins/storybook',
  ],
  features: {
    babelModeV7: true,
  },
  webpackFinal: async (config, { configType }) => {
    // apply any global webpack configs that might have been specified in .storybook/main.js
    if (rootMain.webpackFinal) {
      config = await rootMain.webpackFinal(config, { configType });
    }

    config.module.rules.push({
      test: /\.ttf$/,
      use: ['file-loader'],
    });

    // add your own webpack tweaks if needed
    config.resolve.alias['@cognite/cdf-sdk-singleton'] = require.resolve(
      '../src/environments/mock/cogniteSdkSingleton.ts'
    );

    return config;
  },
};