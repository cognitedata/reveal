const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  webpackFinal: async (webpackConfig) => {
    webpackConfig.resolve.extensions.push('.ts', '.tsx');
    webpackConfig.node = {
      '@cognite/cdf-sdk-singleton': 'mock',
    };
    webpackConfig.resolve.modules = [
      path.resolve(__dirname, '../src'),
      'node_modules',
    ];
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      '@cognite/cdf-sdk-singleton': path.resolve(
        __dirname,
        'sdk-singleton-mock.js'
      ),
    };
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
  typescript: { reactDocgen: false },
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
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
