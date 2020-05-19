const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

function resolve(dir)
{
  return path.resolve(__dirname, dir);
}

module.exports = {
  mode: 'development',
  entry: './main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    alias: {
      '@': resolve('src'),
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    sourceMapFilename: '[name].map',
  },
  devtool: 'inline-source-map',
  devServer: {
    https: false,
    writeToDisk: true,
    contentBase: [resolve('public/')]
  },
  plugins: [
    new HtmlWebpackPlugin(),
  ],
};
