module.exports = {
  stories: [
    '../src/**/*.stories.@(ts|tsx|mdx)',
    '../src/**/__stories__/*.stories.@(ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/preset-create-react-app',
    {
      name: '@storybook/addon-docs',
      options: { configureJSX: true },
    },
    '@storybook/addon-viewport/register',
  ],
};
