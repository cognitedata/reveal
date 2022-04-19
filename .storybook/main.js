const path = require('path');

module.exports = {
  stories: [
    '../src/docs/index.stories.mdx',
    '../**/*.stories.mdx',
    '../**/*.stories.tsx',
  ],
  webpackFinal: async webpackConfig => {
    webpackConfig.resolve.extensions.push('.ts', '.tsx');
    webpackConfig.resolve.modules = [
      path.resolve(__dirname, '../src/'),
      'node_modules',
    ];
    return webpackConfig;
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldRemoveUndefinedFromOptional: false,
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: prop =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-knobs',
    {
      name: '@storybook/addon-docs',
      options: { configureJSX: true },
    },
    '@storybook/addon-essentials',
    {
      name: '@storybook/addon-storysource',
      options: {
        rule: {
          // test: [/\.stories\.jsx?$/], This is default
          include: [path.resolve(__dirname, '../')], // You can specify directories
        },
        loaderOptions: {
          prettierConfig: { printWidth: 80, singleQuote: false },
        },
      },
    },
  ],
};
