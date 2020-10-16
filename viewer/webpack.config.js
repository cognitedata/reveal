/*!
 * Copyright 2020 Cognite AS
 */
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const logger = require('webpack-log')('reveal');
const packageJSON = require('./package.json');
const webpack = require('webpack');
const { publicPath, workerCDNPath, getEnvArg } = require('../parser-worker/buildUtils');

const MIXPANEL_TOKEN_DEV = '00193ed55feefdfcf8a70a76bc97ec6f';
const MIXPANEL_TOKEN_PROD = '8c900bdfe458e32b768450c20750853d';

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = env => {
  const development = getEnvArg(env, 'development', false);
  const publicPathViewer = publicPath || workerCDNPath;

  logger.info('Viewer build config:');
  logger.info({ development, publicPathViewer });

  return {
    mode: development ? 'development' : 'production',
    entry: {
      index: './src/index.ts',
      experimental: './src/experimental.ts'
    },
    target: 'web',
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      symlinks: false,
      alias: {
        '@': resolve('src')
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              onlyCompileBundledFiles: true,
              compilerOptions: !development
                ? {}
                : {
                    noUnusedLocals: false,
                    noUnusedParameters: false
                  }
            }
          },
          exclude: [/node_modules/, /src\/__tests__/]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/,
          use: ['file-loader']
        },
        {
          test: /\.(glsl|vert|frag)$/,
          exclude: '/node_modules/',
          use: ['raw-loader', 'glslify-loader']
        },
        {
          test: /\.css$/,
          use: ['raw-loader']
        }
      ]
    },
    externals: [nodeExternals()],
    output: {
      filename: '[name].js',
      publicPath: publicPathViewer,
      path: path.resolve(__dirname, 'dist'),
      sourceMapFilename: '[name].map',
      globalObject: `(typeof self !== 'undefined' ? self : this)`,
      libraryTarget: 'umd'
    },
    devtool: development ? 'inline-source-map' : 'source-map',
    watchOptions: {
      aggregateTimeout: 1500,
      ignored: [/node_modules/]
    },
    optimization: {
      usedExports: true
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': JSON.stringify({
          VERSION: packageJSON.version,
          MIXPANEL_TOKEN: development ? MIXPANEL_TOKEN_DEV : MIXPANEL_TOKEN_PROD
        })
      })
    ]
  };
};
