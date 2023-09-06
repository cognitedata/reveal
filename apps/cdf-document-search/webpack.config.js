const {
  withSingleSpa,
} = require('../../tools/webpack/single-spa-webpack-config');
const { filterEnvVars } = require('../../tools/webpack/filter-env-vars');
const { composePlugins, withNx } = require('@nx/webpack');
const webpack = require('webpack');
const PrefixWrap = require('postcss-prefixwrap');
module.exports = composePlugins(
  withNx(),
  filterEnvVars(),
  withSingleSpa({ useMockEnv: false }),
  (config) => {
    const nodeEnv = process.env.NODE_ENV || 'production';

    config.resolve.fallback = { path: require.resolve('path-browserify') };

    if (nodeEnv === 'mock' || nodeEnv === 'development') {
      // add your own webpack tweaks if needed
      config.resolve.alias['@cognite/cdf-sdk-singleton'] = require.resolve(
        './src/mock/cogniteSdkSingleton.ts'
      );
    }

    config.plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser',
      })
    );

    config.module.rules.push({
      test: /\.(png|jpe?g|gif)$/i,
      use: [
        {
          loader: 'file-loader',
        },
      ],
    });

    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: 'babel-loader',
        },
        {
          loader: 'react-svg-loader',
          options: {
            jsx: true, // true outputs JSX tags
          },
        },
      ],
    });

    config.module.rules.push({
      test: /\.less$/,
      use: [
        {
          loader: 'style-loader', // creates style nodes from JS strings
        },
        {
          loader: 'css-loader', // translates CSS into CommonJS
        },
        {
          loader: 'less-loader', // compiles Less to CSS
        },
      ],
    });

    const {
      styleScope,
    } = require(`../../apps/cdf-document-search/src/styleScope`);

    config.module.rules.push({
      test: /\.css$/,
      use: [
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
      ],
    });

    return config;
  }
);
