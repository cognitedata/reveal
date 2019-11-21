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
    ],
  };

  if (development) {
    const examplesInput = [
      {
        name: "threejs-simple",
        title: "Simple",
        entry: './src/examples/threejs/simple.ts',
      },
      {
        name: "threejs-post-processing-effects",
        title: "Post processing effects",
        entry: './src/examples/threejs/post-processing-effects.ts',
      },
      {
        name: "threejs-two-models",
        title: "Two models",
        entry: './src/examples/threejs/two-models.ts',
      },
      {
        name: "threejs-with-pointcloud",
        title: "CAD model with point cloud",
        entry: './src/examples/threejs/sector-with-pointcloud.ts',

      }
    ];

    const examples = examplesInput.map(example => {
      const {name, title, entry} = example;
      return {
        name,
        title,
        entry,
        script: `${name}.js`,
        page: `example-${name}.html`,
      };
    });

    config.target = 'web';

    for (const example of examples) {
      const { entry, name, page, script, title } = example;
      config.entry[name] = entry;
      config.plugins.push(
        new HtmlWebpackPlugin({
          templateParameters: {
            'title': title,
            'script': script
          },
          hash: true,
          inject: false,
          template: 'src/examples/template-example.ejs',
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

