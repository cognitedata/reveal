const { override, useBabelRc } = require('customize-cra');
const PrefixWrap = require('postcss-prefixwrap');
const webpack = require('webpack');
const path = require('path');

const { styleScope } = require('./src/styles/styleScope');

const CSS_REGEX = /\.css$/;
const LESS_REGEX = /\.less$/;

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
        {
          test: LESS_REGEX,
          use: [
            ...styleLoaders,
            {
              loader: 'less-loader',
              options: {
                lessOptions: {
                  modifyVars: {
                    'root-entry-name': 'default',
                  },
                  javascriptEnabled: true,
                },
              },
            },
          ],
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
    const isFusion = process.env.REACT_APP_DOMAIN === 'fusion';
    if (isFusion) return fusionConfig(config);
    else return legacyConfig(config);
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

const commonConfig = (config) => {
  // Replacing create-react-app style loaders (only for css files matching
  // the regex).
  config = replaceStyleLoaders(config);

  // Bumping react-scripts to version 5 and above requires the following fix:
  // https://alchemy.com/blog/how-to-polyfill-node-core-modules-in-webpack-5
  // This is a setup commonly found in other Fusion sub-apps as well.
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    "path": require.resolve("path-browserify")
  })
  config.resolve.fallback = fallback;

  return config;
}

const legacyConfig = (config) => {
  // We have a separate entry file for Legacy Charts.
  // Don't forget to change this field if you rename or move the Legacy Charts entry file!
  config.entry = './src/index-legacy.tsx';

  // In the Legacy Charts, @cognite/cdf-sdk-singleton is not available since
  // Fusion injects it via single SPA. Therefore in Legacy Charts we use
  // a fallback instead - the "mocked" SDK uses functions with the same names,
  // but adjusted to Legacy Charts use-case.
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    "@cognite/cdf-sdk-singleton": require.resolve("./src/sdk/index.ts")
  })
  config.resolve.fallback = fallback;

  const configWithCommonConfig = commonConfig(config);
  return configWithCommonConfig;
}

const fusionConfig = (config) => {
  // We have a separate entry file for Charts in Fusion.
  // Don't forget to change this field if you rename or move the Charts in Fusion entry file!
  config.entry = './src/index-fusion.tsx';
  // Compiling our code to System.register format to use polyfill-like
  // behavior of SystemJS for import maps and in-browser modules.
  // https://single-spa.js.org/docs/recommended-setup/#systemjs
  // https://single-spa.js.org/docs/recommended-setup/#build-tools-webpack--rollup
  config.output.libraryTarget = 'system';

  // Using a single entry point.
  // https://single-spa.js.org/docs/recommended-setup/#build-tools-webpack--rollup
  config.output.filename = 'index.js';

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
    ...config.externals,
    'single-spa': 'single-spa',
    '@cognite/cdf-sdk-singleton': '@cognite/cdf-sdk-singleton',
    '@cognite/cdf-route-tracker': '@cognite/cdf-route-tracker',
  };

  // remove source map warning (see : https://github.com/facebook/create-react-app/discussions/11767#discussioncomment-3416044)
  // todo: remove once data-exploration-components is properly updated from this dependency
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

  // Adding process fallback as Webpack 5 removed them
  // https://github.com/facebook/create-react-app/pull/11764
  // https://github.com/facebook/create-react-app/issues/11951
  const plugins = config.plugins;
  config.plugins = [
    ...plugins,
    new webpack.DefinePlugin({
      process: {},
    }),
  ]

  const configWithCommonConfig = commonConfig(config);
  return configWithCommonConfig;
}
