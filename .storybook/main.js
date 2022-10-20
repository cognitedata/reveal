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
  }
};
