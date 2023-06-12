const { override, useBabelRc } = require('customize-cra');
const PrefixWrap = require('postcss-prefixwrap');
const { styleScope } = require('apps/cdf-document-search/src/utils/styleScope');

const CSS_REGEX = /\.css$/;
const cssRegexMatcher = (rule) =>
  rule.test && rule.test.toString() === CSS_REGEX.toString();

const replaceStyleLoaders = (config) => {
  const styleLoaders = [
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

  config.module.rules = [
    ...config.module.rules.filter((rule) => !Array.isArray(rule.oneOf)),
    {
      oneOf: [
        {
          test: CSS_REGEX,
          use: styleLoaders,
          sideEffects: true,
        },
        ...config.module.rules
          .find((rule) => Array.isArray(rule.oneOf))
          .oneOf.filter((rule) => {
            return !cssRegexMatcher(rule);
          }),
      ],
    },
  ];

  return config;
};

module.exports = {
  webpack: override(useBabelRc(), (config) => {
    config.output.libraryTarget = 'system';
    config.output.filename = `index.js`;

    // Replacing create-react-app style loaders (only for css files matching
    // the regex).
    config = replaceStyleLoaders(config);

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

    // remove source map warning (see : https://github.com/facebook/create-react-app/discussions/11767#discussioncomment-3416044)
    // todo: remove once data-exploration-components is properly updated to >5 versions
    config.ignoreWarnings = [
      function ignoreSourcemapsloaderWarnings(warning) {
        return (
          warning.module &&
          warning.module.resource.includes('node_modules') &&
          warning.details &&
          warning.details.includes('source-map-loader')
        );
      },
    ];

    return config;
  }),
  devServer(configFunction) {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      config.headers = {
        ...config.headers,
        'Access-Control-Allow-Origin': '*',
      };

      config.https = true;

      return config;
    };
  },
};
