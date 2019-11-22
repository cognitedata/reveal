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
      stats: 'minimal',
      contentBase: [
        resolve('public/'),
        resolve('dist/'),
        resolve('node_modules/cesium/Source/')
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

      // Cesium
      new webpack.DefinePlugin({
        // Define relative base path in cesium for loading assets
        CESIUM_BASE_URL: JSON.stringify('/')
      }),
      new CopyWebpackPlugin([ { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' } ]),
      new CopyWebpackPlugin([ { from: cesiumSource, to: 'Cesium' } ]),
    ],
  };

  if (development) {
    const examplesInput = [
      {
        name: "threejs-simple",
        title: "Simple",
        entry: './src/examples/threejs/simple.ts',
        template: 'src/examples/template-example.ejs'
      },
      {
        name: "threejs-post-processing-effects",
        title: "Post processing effects",
        entry: './src/examples/threejs/post-processing-effects.ts',
        template: 'src/examples/template-example.ejs'
      },
      {
        name: "threejs-with-pointcloud",
        title: "CAD model with point cloud",
        entry: './src/examples/threejs/sector-with-pointcloud.ts',
        template: './src/examples/template-example.ejs'
      },
      {
        name: "cesiumjs-basic",
        title: 'CesiumJS basic',
        entry: './src/examples/cesiumjs/basic.ts',
        template: './src/examples/cesiumjs/template.ejs'
      },
      {
        name: "threejs-two-models",
        title: "Two models",
        entry: './src/examples/threejs/two-models.ts',
        template: './src/examples/cesiumjs/template.ejs'
      },
    ];

    const examples = examplesInput.map(example => {
      const {name, title, entry, template} = example;
      return {
        name,
        title,
        entry,
        template,
        script: `${name}.js`,
        page: `example-${name}.html`,
      };
    });

    config.target = 'web';

    for (const example of examples) {
      const { entry, name, page, script, title, template } = example;
      config.entry[name] = entry;
      config.plugins.push(
        new HtmlWebpackPlugin({
          templateParameters: {
            'title': title,
            'script': script
          },
          hash: true,
          inject: false,
          template: template,
          filename: page,
        })
      );
    }

    config.plugins.push(new HtmlWebpackPlugin({
      templateParameters: {
        'examples': examples,
      },
      hash: true,
      inject: false,
      template: 'src/examples/template-index.ejs',
    }));
  }

  return config;
};

