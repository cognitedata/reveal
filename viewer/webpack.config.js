const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkerPlugin = require('worker-plugin');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

// The path to the ceisum source code
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

function resolve(dir) {
  return path.resolve(__dirname, dir);
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
  if (env[name] === "true") {
    return true;
  }
  if (env[name] === "false") {
    return false;
  }
  return env[name];
}

module.exports = env => {
  const development = arg(env, "development", false);
  const threeExamplesEnabled = arg(env, "three-examples", true);
  const cesiumExamplesEnabled = arg(env, "cesium-examples", true);

  console.log(
    `Build config:
    - development: ${development}
    - Three JS examples: ${threeExamplesEnabled}
    - Cesium examples: ${cesiumExamplesEnabled}
    `
  );

  const config = {
    mode: development ? "development" : "production",
    entry: {
      index: './src/index.ts',
    },
    target: "web",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: [
            /node_modules/,
            /src\/__tests__/,
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/,
          use: [
            'file-loader',
          ],
        },
        {
          test: /\.(glsl|vert|frag)$/,
          exclude: '/node_modules/',
          use: [
            'raw-loader',
            'glslify-loader'
          ]
        }
      ],
    },
    externals: development ? undefined : [nodeExternals()],
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      sourceMapFilename: '[name].map',
      globalObject: `(typeof self !== 'undefined' ? self : this)`,
      libraryTarget: 'umd',
    },
    devtool: development ? "inline-source-map" : "source-map",
    watchOptions: {
      aggregateTimeout: 1500,
      ignored: [
        'node_modules/',
      ],
    },
    optimization: {
      usedExports: true,
    },
    plugins: [
      new WasmPackPlugin({
        crateDirectory: ".",
        forceMode: 'production',
      }),
      new WorkerPlugin(),
    ],
  };

  return config;
};

