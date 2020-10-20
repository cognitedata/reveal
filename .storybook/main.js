const path = require('path');

module.exports = {
  stories: [
    '../src/docs/index.stories.mdx',
    '../src/**/*.stories.mdx',
    '../src/**/*.stories.tsx',
  ],
  webpackFinal: async (webpackConfig) => {
    webpackConfig.resolve.extensions.push('.ts', '.tsx');
    webpackConfig.node = {
      '@cognite/cdf-sdk-singleton': 'mock',
    };
    webpackConfig.resolve.modules = [
      path.resolve(__dirname, '../src'),
      'node_modules',
    ];
    webpackConfig.module.rules = webpackConfig.module.rules
      .filter((rule) => !Array.isArray(rule.oneOf))
      .filter((el) => el.test !== /\.css$/)
      .concat([
        {
          oneOf: [
            {
              test: /\.css$/,
              use: [
                {
                  loader: 'style-loader',
                  options: {
                    esModule: true,
                    injectType: 'lazyStyleTag',
                  },
                },
                'css-loader',
              ],
              include: path.resolve(__dirname, '../'),
            },
            ...webpackConfig.module.rules
              .find((rule) => Array.isArray(rule.oneOf))
              .oneOf.filter((el) => el.test !== /\.css$/),
          ],
        },
      ]);
    return webpackConfig;
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldRemoveUndefinedFromOptional: false,
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-knobs',
    '@storybook/addon-links',
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
          include: [path.resolve(__dirname, '../src')], // You can specify directories
        },
        loaderOptions: {
          prettierConfig: { printWidth: 80, singleQuote: false },
        },
      },
    },
  ],
};
