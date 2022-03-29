const { edit, remove, getPaths } = require('@rescripts/utilities');
const PrefixWrap = require('postcss-prefixwrap');
const { styleScope } = require('./src/utils/styleScope');

const addLoaders = (config) => {
  const cssRegex = /\.css$/;

  //Matchers to find the array of rules and css-file loader
  const loadersMatcher = (inQuestion) =>
    inQuestion.rules &&
    inQuestion.rules.find &&
    inQuestion.rules.find((rule) => Array.isArray(rule.oneOf));
  const cssMatcher = (inQuestion) =>
    inQuestion.test && inQuestion.test.toString() === cssRegex.toString();

  //Return set of loaders needed to process css files
  const getStyleLoader = () => [
    {
      loader: 'style-loader',
      options: {
        // use esModules to propery load and unload the styles in the dom when
        // the root app is mounted / unmounted
        esModule: true,
        injectType: 'lazyStyleTag',
        insert: function insertAtTop(element) {
          var parent = document.querySelector('head');
          parent.insertBefore(element, parent.firstChild);
        },
      },
    },
    {
      loader: require.resolve('css-loader'),
      options: {
        modules: {
          // Use this to not change the css-classnames in the .css files
          // important to not break antd and cogs.
          localIdentName: '[local]',
        },
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            PrefixWrap(`.${styleScope}`, {
              ignoredSelectors: [':root'],
            }),
          ],
        },
      },
    },
  ];

  //Transformer function
  const transform = (match) => ({
    ...match,
    rules: [
      ...match.rules.filter((rule) => !Array.isArray(rule.oneOf)),
      {
        oneOf: [
          {
            test: cssRegex,
            use: getStyleLoader(),
            sideEffects: true,
          },
          ...match.rules.find((rule) => Array.isArray(rule.oneOf)).oneOf,
        ],
      },
    ],
  });

  //Remove the set of already configured loaders to process css files
  config = remove(getPaths(cssMatcher, config), config);
  //Add our set of newly configured loaders
  config = edit(transform, getPaths(loadersMatcher, config), config);

  return config;
};

module.exports = [
  ['use-babel-config', '.babelrc'],
  {
    webpack: (config) => {
      config.output.libraryTarget = 'system';
      config.output.filename = `index.js`;

      config = addLoaders(config);

      delete config.optimization;
      config.plugins = config.plugins
        .filter((plugin) => plugin.constructor.name !== 'HtmlWebpackPlugin')
        .filter((plugin) => plugin.constructor.name !== 'MiniCssExtractPlugin');

      config.externals = {
        react: 'react',
        'react-dom': 'react-dom',
        'single-spa': 'single-spa',
        '@cognite/cdf-sdk-singleton': '@cognite/cdf-sdk-singleton',
      };
      return config;
    },
    devServer: (config) => {
      config.headers = {
        ...config.headers,
        'Access-Control-Allow-Origin': '*',
      };

      config.https = true;

      // Return your customised Webpack Development Server config.
      return config;
    },
  },
];
