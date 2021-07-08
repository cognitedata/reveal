const path = require('path');
const packageJson = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

  mode: 'development',

  entry: './app/index.ts',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },

  resolve: {
    extensions: ['.ts', '.js'],
    symlinks: false
  },

  devServer: {
    contentBase: './dist',
  },

  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: 'ts-loader'
      }
    ]
  },

  plugins: [new HtmlWebpackPlugin({ title: packageJson.name })]
};