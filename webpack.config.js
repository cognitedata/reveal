const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkerPlugin = require('worker-plugin');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const path = require('path');
const nodeExternals = require('webpack-node-externals');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = env => {
  const development = (env && env.development);
  const config = {
    mode: development ? "development" : "production",
    entry: {
      index: './src/index.ts',
    },
    target: "node",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
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
    devtool: development ? "inline-source-map" : undefined,
    devServer: {
      https: true,
      port: 8080,
      stats: 'minimal',
      contentBase: [
        resolve('public/'),
        resolve('dist/')
      ]
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
      // Examples
    ],
  };

  if (development) {
    config.entry["example_simple"] = './src/examples/threejs/simple.ts';
    config.entry["example_threejs_post_processing_effects"] = './src/examples/threejs/post-processing-effects.ts';
    config.plugins.push(
      new HtmlWebpackPlugin({
        templateParameters: {
          'title': 'ThreeJS Post-processing effects',
          'entry': 'example_threejs_post_processing_effects.js'
        },
        hash: true,
        template: 'src/examples/template.ejs',
        filename: 'example-threejs-post-processing-effects.html'
      })
    );
    config.plugins.push(
      new HtmlWebpackPlugin({
        templateParameters: {
          'title': 'Simple THREE js example',
          'entry': 'example_simple.js'
        },
        hash: true,
        template: 'src/examples/template.ejs',
        filename: 'example-threejs-simple.html'
      })
    );
  }

  return config;
};

