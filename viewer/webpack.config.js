/*!
 * Copyright 2020 Cognite AS
 */
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const getLogger = require('webpack-log');
const logger = getLogger('reveal');
const packageJSON = require('./package.json');
const webpack = require('webpack');

const MIXPANEL_TOKEN_DEV = '00193ed55feefdfcf8a70a76bc97ec6f';
const MIXPANEL_TOKEN_PROD = '8c900bdfe458e32b768450c20750853d';
const publicPath = `https://unpkg.com/${packageJSON.name}@${packageJSON.version}/`;

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

const getCommonConfig = isDevelopment => {
  return {
    mode: isDevelopment ? 'development' : 'production',
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
              compilerOptions: !isDevelopment
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
    devtool: isDevelopment ? 'inline-source-map' : 'source-map',
    watchOptions: {
      aggregateTimeout: 1500,
      ignored: [/node_modules/]
    },
    optimization: {
      usedExports: true
    },
    output: {
      filename: '[name].js',
      // in practice it's better to use in sources like global-path + /worker and compile without publicPath=""
      // the only public path will be worker stuff. Worker stuff in turn pointing on CDN...
      // how to align worker public path, that we don't control, with that public path?
      publicPath: `https://unpkg.com/${packageJSON.name}@${packageJSON.version}/`,
      path: path.resolve(__dirname, 'dist'),
      sourceMapFilename: '[name].map',
      libraryTarget: 'umd'
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': JSON.stringify({
          VERSION: packageJSON.version,
          MIXPANEL_TOKEN: isDevelopment ? MIXPANEL_TOKEN_DEV : MIXPANEL_TOKEN_PROD
        })
      })
    ]
  };
};

module.exports = env => {
  const isDevelopment = arg(env, 'development', false);

  logger.info('Build config:');
  logger.info(`  - development: ${isDevelopment}`);

  const mainConfig = {
    ...getCommonConfig(isDevelopment),
    entry: {
      index: './src/index.ts',
      experimental: './src/experimental.ts'
    }
  };

  const workerConfig = {
    ...getCommonConfig(isDevelopment),
    entry: {
      'reveal.parser.worker': './src/utilities/workers/reveal.parser.worker.ts'
    },
    target: 'webworker',
    output: {
      ...mainConfig.output,
      globalObject: 'self || this'
    },
    plugins: mainConfig.plugins.concat(
      new WasmPackPlugin({
        crateDirectory: '.',
        forceMode: 'production',
        watchDirectories: [
          path.resolve(__dirname, 'rust'),
          path.resolve(__dirname, '..', 'i3df', 'src'),
          path.resolve(__dirname, '..', 'f3df', 'src')
        ]
      })
    )
  };

  return [mainConfig, workerConfig];
};
