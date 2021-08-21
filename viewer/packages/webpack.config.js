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
      symlinks: false
    },

    devServer: {
      contentBase: path.resolve(env.dir, './app'),
      disableHostCheck: true
    },

    module: {
      rules: [
        {
          test: /\.tsx?/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, '../tsconfig.common.json'),
              compilerOptions: {
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

    plugins: [new HtmlWebpackPlugin({ title: require(path.resolve(env.dir, './package.json')).name })]
  };
};
