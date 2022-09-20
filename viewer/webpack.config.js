/*!
 * Copyright 2021 Cognite AS
 */
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const copyPkgJsonPlugin = require('copy-pkg-json-webpack-plugin');
const packageJSON = require('./package.json');
const webpack = require('webpack');
const exec = require('child_process').exec;

const MIXPANEL_TOKEN_DEV = '00193ed55feefdfcf8a70a76bc97ec6f';
const MIXPANEL_TOKEN_PROD = '8c900bdfe458e32b768450c20750853d';

module.exports = env => {
  const development = env?.development ?? false;

  return {
    mode: development ? 'development' : 'production',
    // Internals is not part of prod builds
    entry: {
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
          loader: 'worker-loader',
          options: {
            inline: 'no-fallback'
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
      path: path.resolve(__dirname, 'dist'),
      sourceMapFilename: '[name].map',
      globalObject: `(typeof self !== 'undefined' ? self : this)`,
      library: {
        name: '@cognite/reveal',
        type: 'umd'
      }
    },
    devtool: development ? 'eval-source-map' : 'source-map',
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
          MIXPANEL_TOKEN: development ? MIXPANEL_TOKEN_DEV : MIXPANEL_TOKEN_PROD,
          IS_DEVELOPMENT_MODE: development
        })
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
