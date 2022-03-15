const { override, useBabelRc } = require('customize-cra');
const PrefixWrap = require('postcss-prefixwrap');

const { styleScope } = require('./src/styles/styleScope');

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
      },
    },
    {
      loader: require.resolve('css-loader'),
      options: {
        modules: {
          // Use this to not change the css-classnames in the .css files
          // important to not break cogs.
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
    // Compiling our code to System.register format to use polyfill-like
    // behavior of SystemJS for import maps and in-browser modules.
    // https://single-spa.js.org/docs/recommended-setup/#systemjs
    // https://single-spa.js.org/docs/recommended-setup/#build-tools-webpack--rollup
    config.output.libraryTarget = 'system';

    // Using a single entry point.
    // https://single-spa.js.org/docs/recommended-setup/#build-tools-webpack--rollup
    config.output.filename = 'index.js';

    // Replacing create-react-app style loaders (only for css files matching
    // the regex).
    config = replaceStyleLoaders(config);

    // Disabling webpack's optimization configuration, as that makes it harder
    // to load JS output as a single in-browser JS module.
    // https://single-spa.js.org/docs/recommended-setup/#build-tools-webpack--rollup
    delete config.optimization;

    // Removing html-webpack-plugin.
    // https://single-spa.js.org/docs/faq/#create-react-app
    config.plugins = config.plugins.filter(
      (plugin) => plugin.constructor.name !== 'HtmlWebpackPlugin'
    );

    config.plugins = config.plugins.filter(
      (plugin) => plugin.constructor.name !== 'MiniCssExtractPlugin'
    );

    // Setting shared in-browser modules as webpack externals. This will
    // exclude these dependencies from the output bundle.
    // https://single-spa.js.org/docs/recommended-setup/#build-tools-webpack--rollup
    config.externals = {
      react: 'react',
      'react-dom': 'react-dom',
      'single-spa': 'single-spa',
      '@cognite/cdf-sdk-singleton': '@cognite/cdf-sdk-singleton',
      '@cognite/cdf-route-tracker': '@cognite/cdf-route-tracker',
    };

    return config;
  }),
  devServer(configFunction) {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      config.headers = config.headers || {};

      // Configuring webpack-dev-server for CORS.
      // https://single-spa.js.org/docs/recommended-setup/#build-tools-webpack--rollup
      config.headers['Access-Control-Allow-Origin'] = '*';

      // Configuring webpack-dev-server for HTTPS as we are developing on HTTPS.
      // https://single-spa.js.org/docs/recommended-setup/#build-tools-webpack--rollup
      config.https = true;

      return config;
    };
  },
};
