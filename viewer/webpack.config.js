/*!
 * Copyright 2020 Cognite AS
 */
const WorkerPlugin = require('worker-plugin');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const getLogger = require('webpack-log');
const logger = getLogger('reveal');
const packageJSON = require('./package.json');
const webpack = require('webpack');

const MIXPANEL_TOKEN_DEV = '00193ed55feefdfcf8a70a76bc97ec6f';
const MIXPANEL_TOKEN_PROD = '8c900bdfe458e32b768450c20750853d';

function resolve(dir) {
  return path.join(__dirname, dir);
}

/*
 * Set args on the command line using
 *
 *    webpack --env.argname=value
 *
 */
function arg(env, name, defaultValue) {
  if (env === undefined) {
    return defaultValue;
  }
  if (env[name] === undefined) {
    return defaultValue;
  }
  if (env[name] === 'true') {
    return true;
  }
  if (env[name] === 'false') {
    return false;
  }
  return env[name];
}

module.exports = env => {
  const development = arg(env, 'development', false);

  logger.info('Build config:');
  logger.info(`  - development: ${development}`);

  const config = {
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
        VERSION: JSON.stringify(packageJSON.version),
        MIXPANEL_TOKEN: JSON.stringify(development ? MIXPANEL_TOKEN_DEV : MIXPANEL_TOKEN_PROD)
      }),
      new WasmPackPlugin({
        crateDirectory: '.',
        forceMode: 'production',
        watchDirectories: [
          path.resolve(__dirname, 'rust'),
          path.resolve(__dirname, '..', 'i3df', 'src'),
          path.resolve(__dirname, '..', 'f3df', 'src')
        ]
      }),
      new WorkerPlugin()
    ]
  };

  return config;
};
