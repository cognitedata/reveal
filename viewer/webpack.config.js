/*!
 * Copyright 2021 Cognite AS
 */
const path = require('path');
const RemovePlugin = require('remove-files-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const copyPkgJsonPlugin = require('copy-pkg-json-webpack-plugin');
const logger = require('webpack-log')('reveal');
const packageJSON = require('./package.json');
const workerPackageJSON = require('./node_modules/@cognite/reveal-parser-worker/package.json');
const webpack = require('webpack');
const { publicPath, getWorkerCdnUrl, getEnvArg } = require('../legacy-parser-worker/parser-worker/buildUtils');
const exec = require('child_process').exec;

const MIXPANEL_TOKEN_DEV = '00193ed55feefdfcf8a70a76bc97ec6f';
const MIXPANEL_TOKEN_PROD = '8c900bdfe458e32b768450c20750853d';

const parserWorkerVersion = packageJSON.dependencies['@cognite/reveal-parser-worker'];
if (parserWorkerVersion.split('.').some(i => isNaN(parseInt(i, 10)))) {
  throw new Error(
    `Please specify strict version for @cognite/reveal-parser-worker in viewer/package.json. Got ${parserWorkerVersion}`
  );
}

module.exports = env => {
  const development = getEnvArg(env, 'development', false);
  const publicPathViewer =
    publicPath || getWorkerCdnUrl({ name: workerPackageJSON.name, version: workerPackageJSON.version });

  logger.info('Viewer build config:');
  logger.info({ development, publicPathViewer });

  return {
    mode: development ? 'development' : 'production',
    // Internals is not part of prod builds
    entry: development
      ? {
          index: './index.ts',
          tools: './tools.ts',
          'extensions/datasource': './extensions/datasource.ts',
          internals: './internals.ts'
        }
      : {
          index: './index.ts',
          tools: './tools.ts',
          'extensions/datasource': './extensions/datasource.ts'
        },
    target: 'web',
    resolve: {
      fallback: {
        fs: false,
        path: require.resolve('path-browserify')
      },
      extensions: ['.tsx', '.ts', '.js'],
      symlinks: true
    },
    module: {
      rules: [
        {
          test: /\.worker\.ts$/,
          loader: 'workerize-loader',
          options: {
            inline: true
          }
        },
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.webpack.json',
              onlyCompileBundledFiles: true,
              compilerOptions: !development
                ? {
                    declarationDir: path.resolve(__dirname, 'dist')
                  }
                : {
                    noUnusedLocals: false,
                    noUnusedParameters: false,
                    declarationDir: path.resolve(__dirname, 'dist')
                  }
            }
          },
          exclude: [/src\/.*\.test\.tsx?/, /src\/.*\/stubs\//]
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
        },
        {
          test: /\.wasm$/,
          type: 'asset/inline'
        }
      ]
    },
    externals: [
      nodeExternals({
        allowlist: [/^@reveal/]
      })
    ],
    output: {
      filename: '[name].js',
      publicPath: publicPathViewer,
      path: path.resolve(__dirname, 'dist'),
      sourceMapFilename: '[name].map',
      globalObject: `(typeof self !== 'undefined' ? self : this)`,
      library: {
        name: '@cognite/reveal',
        type: 'umd'
      }
    },
    devtool: development ? 'inline-source-map' : 'source-map',
    watchOptions: {
      aggregateTimeout: 1500,
      ignored: /node_modules/
    },
    plugins: [
      new copyPkgJsonPlugin({
        remove: development
          ? ['devDependencies', 'scripts', 'workspaces', 'husky']
          : ['devDependencies', 'scripts', 'private', 'workspaces', 'husky']
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify({
          VERSION: packageJSON.version,
          WORKER_VERSION: parserWorkerVersion,
          MIXPANEL_TOKEN: development ? MIXPANEL_TOKEN_DEV : MIXPANEL_TOKEN_PROD,
          IS_DEVELOPMENT_MODE: development
        })
      }),
      new RemovePlugin({
        after: {
          test: [
            {
              folder: 'dist',
              method: absoluteItemPath => {
                return new RegExp(/\.worker.js$/, 'm').test(absoluteItemPath);
              }
            }
          ]
        }
      }),
      {
        apply: compiler => {
          compiler.hooks.afterEmit.tapPromise('AfterEmitPlugin', async compilation => {
            await exec('yarn run retarget-types', (err, stdout, stderr) => {
              if (stdout) process.stdout.write(stdout);
              if (stderr) process.stderr.write(stderr);
            });
          });
        }
      }
    ]
  };
};
