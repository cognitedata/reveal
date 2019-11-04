const HtmlWebpackPlugin = require('html-webpack-plugin');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}

const appConfig = {
  mode: 'development',
  entry: {
    main: './src/index.ts',
    example_threejs_post_processing_effects: './src/examples/threejs/post-processing-effects.ts'
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    // filename: 'bundle.js',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    sourceMapFilename: '[name].map',
    globalObject: `(typeof self !== 'undefined' ? self : this)`,
  },

  devtool: 'inline-source-map',
  devServer: {
    https: true,
    port: 8080,
    stats: 'minimal',
    contentBase: [
      resolve('public/'),
      resolve('dist/')
    ]
  },

  plugins: [
    new HtmlWebpackPlugin(),
    new WasmPackPlugin({
      crateDirectory: ".",
      forceMode: 'production',
    }),
    // Examples
    new HtmlWebpackPlugin({
      templateParameters: {
        'title': 'ThreeJS Post-processing effects',
        'entry': 'example_threejs_post_processing_effects.js'
      },
      hash: true,
      inject: false,
      template: 'src/examples/template.ejs',
      filename: 'threejs-post-processing-effects.html'
    })
  ],
};

const workerConfig = {
  mode: 'development',
  entry: "./workers/parser.worker.ts",
  target: "webworker",
  plugins: [
    new WasmPackPlugin({
      crateDirectory: ".",
      forceMode: 'production',
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "parser.worker.js"
  }
};

module.exports = [appConfig, workerConfig];
