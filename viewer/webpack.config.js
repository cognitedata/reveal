/*!
 * Copyright 2021 Cognite AS
 */
const path = require('path');
const RemovePlugin = require('remove-files-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const packageJSON = require('./package.json');
const webpack = require('webpack');
const exec = require('child_process').exec;
const TerserPlugin = require('terser-webpack-plugin');

const MIXPANEL_TOKEN_DEV = '00193ed55feefdfcf8a70a76bc97ec6f';
const MIXPANEL_TOKEN_PROD = '8c900bdfe458e32b768450c20750853d';

module.exports = env => {
  const development = env?.development ?? false;
  const useWorkerSourceMaps = env?.workerSourceMaps === 'true';

  return {
    mode: development ? 'development' : 'production',
    entry: {
      index: './index.ts'
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
          type: 'asset/source',
          use: ['glslify-loader']
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
        allowlist: [/^@reveal/, /sparse-octree/]
      })
    ],
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      sourceMapFilename: '[name].map',
      globalObject: `(typeof self !== 'undefined' ? self : this)`,
      library: {
        name: '@cognite/reveal',
        type: 'umd'
      }
    },
    devtool: false,
    watchOptions: {
      aggregateTimeout: 1500,
      ignored: /node_modules/
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: false
        })
      ]
    },
    plugins: [
      development
        ? new webpack.EvalSourceMapDevToolPlugin({
            test: /\.ts$/,
            exclude: useWorkerSourceMaps ? /^$/ : /\.worker\.ts$/
          })
        : new webpack.SourceMapDevToolPlugin({
            filename: '[file].map'
          }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify({
          VERSION: packageJSON.version,
          MIXPANEL_TOKEN: development ? MIXPANEL_TOKEN_DEV : MIXPANEL_TOKEN_PROD
        })
      }),
      new RemovePlugin({
        after: {
          test: [
            {
              folder: 'dist',
              method: absoluteItemPath => {
                return new RegExp(/\.worker\.js(\.map)?$/, 'm').test(absoluteItemPath);
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
