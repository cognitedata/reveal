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
    symlinks: false,
    alias: {
      // Hackathon: the @cognite/sdk bundled with the linked viewer (portal:../viewer)
      // resolves an older @cognite/sdk-core build that is missing the
      // `makeAutoPaginationMethods` export, which breaks the webpack compile. Force all
      // @cognite/sdk-core imports to the hoisted copy that exports it so the app compiles.
      '@cognite/sdk-core$': path.resolve(__dirname, 'node_modules/@cognite/sdk-core')
    }
  },
  devtool: 'source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/'
  },
  snapshot: {
    // node_modules/@cognite/reveal is a link to ../viewer. Webpack treats everything under
    // node_modules as immutable, so without this it recompiles when the viewer is rebuilt but
    // keeps serving the cached bundle ("Nothing changed"). Excluding the package makes changes
    // to viewer/dist - including rebuilt shaders - reach the browser.
    managedPaths: [/^(.+?[\\/]node_modules[\\/])(?!@cognite[\\/]reveal)/]
  },
  watchOptions: {
    aggregateTimeout: 2000
  }
};
