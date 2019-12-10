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
const revealSource = 'node_modules/@cognite/reveal/dist';

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
  const threeEnabled = arg(env, "three", true);
  const cesiumEnabled = arg(env, "cesium", true);

  console.log(
    `Build config:
    - development: ${development}
    - Three JS support: ${threeEnabled}
    - Cesium support: ${cesiumEnabled}
    `
  );

  const config = {
    mode: development ? "development" : "production",
    entry: {},
    target: "node",
    module: {
      rules: [
        {
          test: /node_modules\/@cognite\/reveal\/dist\/.+\.(js|map)$/, // TODO consider adding ts
          use: ['source-map-loader'],
          enforce: 'pre',
        },
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: [
            /node_modules/,
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/,
          exclude: '/node_modules/',
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
      symlinks: false, // necessary because we symlink the parent folder - source maps fail otherwise
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
      new CopyWebpackPlugin([
        {from: path.join(revealSource, "**/*.wasm"), to: ".", flatten: true},
        {from: path.join(revealSource, "**/*.worker.js"), to: ".", flatten: true}
      ])
    ]
  };

  if (cesiumEnabled) {
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

    if (cesiumEnabled) {
      enabledExamples = enabledExamples.concat([
        {
          name: "cesiumjs-basic",
          title: 'CesiumJS basic',
          entry: './src/cesiumjs/basic.ts',
          template: './src/cesiumjs/template.ejs'
        },
      ]);
    }
    if (threeEnabled) {
      enabledExamples = enabledExamples.concat([
        {
          name: "threejs-simple",
          title: "Simple",
          entry: './src/threejs/simple.ts',
          template: 'template-example.ejs'
        },
        {
          name: "threejs-post-processing-effects",
          title: "Post processing effects",
          entry: './src/threejs/post-processing-effects.ts',
          template: 'template-example.ejs'
        },
        {
          name: "threejs-with-pointcloud",
          title: "CAD model with point cloud",
          entry: './src/threejs/sector-with-pointcloud.ts',
          template: './template-example.ejs'
        },
        {
          name: "threejs-two-models",
          title: "Two models",
          entry: './src/threejs/two-models.ts',
          template: './template-example.ejs'
        },
        {
          name: "threejs-custom-scene-elements",
          title: "Custom ThreeJS scene elements",
          entry: './src/threejs/custom-scene-elements.ts',
          template: './template-example.ejs'
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
      template: 'template-index.ejs',
    }));
  }

  return config;
};

