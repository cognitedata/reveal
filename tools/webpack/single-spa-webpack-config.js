const webpack = require('webpack');
const { edit, remove, getPaths } = require('@rescripts/utilities');
const PrefixWrap = require('postcss-prefixwrap');

const CopyPlugin = require('copy-webpack-plugin');

const replaceStyleLoaders = (config, styleScope) => {
  const CSS_REGEX = /\.css$/;
  const SASS_REGEX = /\.s[ac]ss$/i;
  const LESS_REGEX = /\.less$/;
  const cssRegex = /\.(css|less)$/;

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
              ignoredSelectors: [
                ':root',
                '.monaco-aria-container',
                '[data-reach-tooltip]',
              ],
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
            test: CSS_REGEX,
            use: getStyleLoader(),
            sideEffects: true,
          },
          {
            test: SASS_REGEX,
            use: [
              ...getStyleLoader().slice(0, 2),
              {
                loader: 'sass-loader',
              },
            ],
          },
          {
            test: LESS_REGEX,
            use: [
              ...getStyleLoader(),
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

/**
 * @param {WithReactOptions} pluginOptions
 * @returns {NxWebpackPlugin}
 *
 * Cognite SingleSPA plugin for NX
 * See an example here:
 * https://github.com/nrwl/nx/blob/master/packages/react/plugins/with-react.ts
 */
module.exports = {
  withSingleSpa: function withSingleSpa(pluginOptions = { useMockEnv: true }) {
    return function configure(config, execContext) {
      const projectName = execContext.context.projectName;

      let nodeEnv = process.env.NODE_ENV || 'production';
      if (process.env.NX_TASK_TARGET_CONFIGURATION === 'production') {
        nodeEnv = 'production';
      }

      console.log(
        `SingleSpa webpack config(${nodeEnv}) for ${projectName} was loaded...`
      );

      if (pluginOptions.useMockEnv) {
        return {
          ...config,
          plugins: [...config.plugins],
          // react scripts are causing a lot of errors to be throw in console (Failed to parse source map from...)
          // https://github.com/facebook/create-react-app/discussions/11767
          ignoreWarnings: [/Failed to parse source map/],
        };
      }

      config.entry = {
        ...config.entry,
      };

      config.output.libraryTarget = 'system';
      config.output.chunkLoading = 'jsonp';
      config.output.filename = ({ chunk: { name } }) => {
        return name === 'main' ? 'index.js' : '[name].[contenthash:8].js';
      };

      if (nodeEnv === 'production') {
        config.mode = 'production';
        config.optimization.minimize = true;
      }

      config.plugins.push(
        new webpack.ProvidePlugin({
          React: 'react',
        })
      );

      config.externals = {
        'single-spa': 'single-spa',
        '@cognite/cdf-sdk-singleton': '@cognite/cdf-sdk-singleton',
        '@cognite/cdf-route-tracker': '@cognite/cdf-route-tracker',
      };

      // If this is not set, you will get following error
      // application '@cognite/cdf-solutions-ui' died in status LOADING_SOURCE_CODE: Automatic publicPath is not supported in this browser
      config.output.publicPath = '';

      if (config.optimization) {
        // https://webpack.js.org/guides/code-splitting/#dynamic-imports
        // If we keep the runtime chunk, we get this error
        // application '@cognite/cdf-solutions-ui' died in status LOADING_SOURCE_CODE: "does not export a bootstrap function or array of functions"
        // delete config.optimization['splitChunks'];
        delete config.optimization['runtimeChunk'];
      }

      const {
        styleScope,
      } = require(`../../apps/${projectName}/src/styleScope`);
      config = replaceStyleLoaders(config, styleScope);

      config.module.rules.push({
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        loader: 'file-loader',
      });

      // Remove unneeded plugins
      config.plugins = config.plugins
        .filter((plugin) => plugin.constructor.name !== 'HtmlWebpackPlugin')
        .filter((plugin) => plugin.constructor.name !== 'MiniCssExtractPlugin')
        .filter(
          (plugin) => plugin.constructor.name !== 'IndexHtmlWebpackPlugin'
        );

      // react scripts are causing a lot of errors to be throw in console (Failed to parse source map from...)
      // https://github.com/facebook/create-react-app/discussions/11767
      config.ignoreWarnings = [/Failed to parse source map/];

      return config;
    };
  },
};
