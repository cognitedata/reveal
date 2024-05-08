const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const logger = require('webpack-log')('example');
require('dotenv').config({ path: './.env' });

logger.info(process.env.REACT_APP_CREDENTIAL_ENVIRONMENTS);

module.exports = {
  entry: './src/index.tsx',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    compress: true,
    port: 3549,
    hot: true,
    open: process.env.BROWSER === 'none' ? false : true,
    server: process.env.HTTPS === 'false' ? 'http' : 'https',
    headers: { 'Access-Control-Allow-Origin': '*' },
    historyApiFallback: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: 'css-loader'
      },
      {
        test: /\.svg?/,
        use: 'svg-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './public/index.html'
    }),
    new webpack.DefinePlugin({
      process: {
        env: { REACT_APP_CREDENTIAL_ENVIRONMENTS: JSON.stringify(process.env.REACT_APP_CREDENTIAL_ENVIRONMENTS) }
      }
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.css'],
    symlinks: true
  },
  devtool: 'source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/'
  },
  watchOptions: {
    aggregateTimeout: 2000
  }
};
