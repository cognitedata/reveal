const rootMain = require('../../../.storybook/main');

module.exports = {
  ...rootMain,

  stories: [
    ...rootMain.stories,
    '../src/app/**/*.stories.mdx',
    '../src/app/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    ...rootMain.addons,
    '@storybook/addon-essentials',
    '@nrwl/react/plugins/storybook',
  ],
  features: {
    babelModeV7: true,
  },
  webpackFinal: async (config, { configType }) => {
    // apply any global webpack configs that might have been specified in .storybook/main.js
    if (rootMain.webpackFinal) {
      config = await rootMain.webpackFinal(config, { configType });
    }

    // add your own webpack tweaks if needed
    config.resolve.alias['@cognite/cdf-sdk-singleton'] = require.resolve(
      '../src/environments/mock/cogniteSdkSingleton.ts'
    );

    return config;
  },
};
