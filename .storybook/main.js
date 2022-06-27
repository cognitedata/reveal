module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
    '@storybook/addon-interactions',
  ],
  babel: async (options) => {
    options.plugins.push([
      'istanbul',
      {
        // provide include patterns if you like
        include: ['src/**'],
        // provide exclude patterns if you like
        exclude: ['**/*.d.ts', '**/*{.,-}{spec,stories,types}.{js,jsx,ts,tsx}'],
      },
    ]);

    return options;
  },
};
