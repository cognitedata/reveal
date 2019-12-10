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
    target: "node",
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
    devtool: development ? "inline-source-map" : undefined,
    watchOptions: {
      aggregateTimeout: 1500,
      ignored: ['node_modules/']
    },
    devServer: {
      https: true,
      stats: 'minimal',
      contentBase: [
        resolve('public/'),
        resolve('dist/'),
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

  if (cesiumExamplesEnabled) {
    // For the devServer, we need to resolve files in the Cesium source as well
    config.devServer.contentBase.push(resolve('node_modules/cesium/Source/'));
    // The Cesium workers need to be copied manually
    config.plugins.push(new CopyWebpackPlugin([{ from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' } ]));
    config.plugins.push(new CopyWebpackPlugin([{ from: cesiumSource, to: 'Cesium' } ]));
    config.plugins.push(new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify('/')
      })
    );
  }

  if (development) {
    config.target = 'web';
    let enabledExamples = [];

    if (cesiumExamplesEnabled) {
      enabledExamples = enabledExamples.concat([
        {
          name: "cesiumjs-basic",
          title: 'CesiumJS basic',
          entry: './src/examples/cesiumjs/basic.ts',
          template: './src/examples/cesiumjs/template.ejs'
        },
      ]);
    }
    if (threeExamplesEnabled) {
      enabledExamples = enabledExamples.concat([
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
          name: "threejs-two-models",
          title: "Two models",
          entry: './src/examples/threejs/two-models.ts',
          template: './src/examples/template-example.ejs'
        },
        {
          name: "threejs-custom-scene-elements",
          title: "Custom ThreeJS scene elements",
          entry: './src/examples/threejs/custom-scene-elements.ts',
          template: './src/examples/template-example.ejs'
        },
      ]);
    }

    if (enabledExamples.length < 1) {
      console.log(`No examples enabled!`);
    } else {
      console.log(`Enabled examples:`);
    }

    for (const example of enabledExamples) {
      console.log(`- ${example.name}`);
    }

    const examples = enabledExamples.map(example => {
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

