/*!
 * Copyright 2021 Cognite AS
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => {
  return {
    mode: 'development',

    entry: path.resolve(env.dir, './app/index.ts'),

    output: {
      path: path.resolve(env.dir, 'dist'),
      filename: 'index.js'
    },

    resolve: {
      extensions: ['.ts', '.js'],
      symlinks: true
    },

    devServer: {
      contentBase: path.resolve(env.dir, './app'),
      disableHostCheck: true,
      watchContentBase: true,
      https: true,
      watchOptions: {
        poll: true
      }
    },

    node: {
      fs: 'empty'
    },

    module: {
      rules: [
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

    plugins: [new HtmlWebpackPlugin({ title: require(path.resolve(env.dir, './package.json')).name })]
  };
};
