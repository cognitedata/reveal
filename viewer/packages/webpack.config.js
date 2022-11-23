/*!
 * Copyright 2021 Cognite AS
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

function setTestFixture(testFixture) {
  if (testFixture === undefined) {
    return false;
  }

  const parsedTestFixturePath = path.parse(testFixture);

  if (parsedTestFixturePath === undefined) {
    throw new Error('Unkown test fixture arugment');
  }

  return '?testfixture=' + parsedTestFixturePath.name;
}

module.exports = env => {
  const entryFile = '../visual-tests/VisualTest.browser.ts';
  const open = setTestFixture(env.testFixture);
  let cdfEnv;
  try {
    cdfEnv = fs.readFileSync(path.resolve(__dirname, '../visual-tests/.cdf-env.json')).toString();
  } catch (_) {
    const yellowColor = '\x1b[33m';
    console.warn(yellowColor, '\nWARNING: CDF environments are not set which only allows local models to be loaded\n');
    cdfEnv = '';
  }
  return {
    mode: 'development',

    entry: path.resolve(__dirname, entryFile),

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js'
    },

    experiments: {
      topLevelAwait: true
    },

    resolve: {
      fallback: {
        fs: false,
        path: require.resolve('path-browserify')
      },
      extensions: ['.ts', '.js'],
      symlinks: true
    },

    devServer: {
      static: [
        {
          directory: path.resolve(__dirname, 'sector-parser/app')
        },
        {
          directory: path.resolve(__dirname, '../../examples/public'),
          watch: false
        }
      ],
      allowedHosts: 'all',
      server: 'https',
      port: 8080,
      open
    },

    module: {
      rules: [
        {
          test: /\.worker\.ts$/,
          loader: 'workerize-loader',
          options: {
            inline: true
          }
        },
        {
          test: /\.tsx?/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, '../tsconfig.json'),
              compilerOptions: {
                // set less lint requirement for test apps
                noUnusedLocals: false,
                noUnusedParameters: false
              }
            }
          }
        },
        {
          test: /VisualTest.browser\.tsx?/,
          use: path.resolve('./visual-tests/globVisualTestLoader.js')
        },
        {
          test: /\.(glsl|vert|frag)$/,
          exclude: '/node_modules/',
          use: ['raw-loader', 'glslify-loader']
        },
        {
          test: /\.css$/,
          use: ['raw-loader']
        },
        {
          test: /\.wasm$/,
          type: 'asset/inline'
        }
      ]
    },
    watchOptions: {
      poll: 1000
    },

    devtool: 'eval-source-map',

    plugins: [
      new HtmlWebpackPlugin({ title: require(path.resolve('./packages/sector-parser', './package.json')).name }),
      new webpack.ProvidePlugin({
        process: 'process/browser'
      }),
      new webpack.DefinePlugin({
        CDF_ENV: cdfEnv
      })
    ]
  };
};
