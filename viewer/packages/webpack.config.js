/*!
 * Copyright 2021 Cognite AS
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = env => {
  const entryFile = env.example ?? './app/index.ts';
  return {
    mode: 'development',

    entry: path.resolve(env.dir, entryFile),

    output: {
      path: path.resolve(env.dir, 'dist'),
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
      host: 'localhost',
      static: [
        {
          directory: path.resolve(__dirname, env.dir + '/app')
        },
        {
          directory: path.resolve(__dirname, '../../examples/public'),
          watch: false
        }
      ],
      allowedHosts: 'all',
      server: 'https'
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
          },
          exclude: [/.*\.test\.tsx?/g, /.*\/stubs\//]
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
      new HtmlWebpackPlugin({ title: require(path.resolve(env.dir, './package.json')).name }),
      new webpack.ProvidePlugin({
        process: 'process/browser'
      })
    ]
  };
};
