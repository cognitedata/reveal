/*!
 * Copyright 2021 Cognite AS
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = env => {
  const entryFile = '../visual-tests/VisualTests.ts';
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
      port: 12345
    },

    module: {
      rules: [
        {
          test: /\.worker\.ts$/,
          loader: 'worker-loader',
          options: {
            inline: 'no-fallback'
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
          test: /\.(glsl|vert|frag)$/,
          exclude: '/node_modules/',
          use: ['raw-loader', 'glslify-loader']
        }
      ]
    },

    devtool: 'inline-source-map',

    plugins: [
      new HtmlWebpackPlugin({ title: require(path.resolve('./packages/sector-parser', './package.json')).name }),
      new webpack.ProvidePlugin({
        process: 'process/browser'
      })
    ]
  };
};
