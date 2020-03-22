const WorkerPlugin = require('worker-plugin');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const getLogger = require('webpack-log');
const logger = getLogger('reveal');

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

  logger.info("Build config:");
  logger.info(`  - development: ${development}`);

  const config = {
    mode: development ? "development" : "production",
    entry: {
      index: './src/index.ts',
      threejs: './src/threejs.ts'
    },
    target: "web",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              onlyCompileBundledFiles: true,
              compilerOptions: !development ? {} : {
                noUnusedLocals: false,
                noUnusedParameters: false
              }
            },
          },
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
    externals: [nodeExternals()],
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      symlinks: false,
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
        watchDirectories: [
          path.resolve(__dirname, '..', 'i3df', 'src'),
          path.resolve(__dirname, '..', 'f3df', 'src'),
        ]
      }),
      new WorkerPlugin()
    ],
  };

  return config;
};

