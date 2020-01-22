const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const getLogger = require('webpack-log');
const logger = getLogger('reveal-examples');

// The path to the ceisum source code
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';
const revealSource = 'node_modules/@cognite/reveal';

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

function resolve(dir) {
  return path.resolve(__dirname, dir);
}

const allExamples = [
  {
    name: "threejs-simple",
    title: "Simple",
    entry: './src/threejs/simple.ts',
    template: 'template-example.ejs',
    type: 'threejs'
  },
  {
    name: "threejs-simple-pointcloud",
    title: "Simple pointcloud",
    entry: './src/threejs/simple-pointcloud.ts',
    template: 'template-example.ejs',
    type: 'threejs'
  },
  {
    name: "threejs-post-processing-effects",
    title: "Post processing effects",
    entry: './src/threejs/post-processing-effects.ts',
    template: 'template-example.ejs',
    type: 'threejs'
  },
  {
    name: "threejs-with-pointcloud",
    title: "CAD model with point cloud",
    entry: './src/threejs/sector-with-pointcloud.ts',
    template: 'template-example.ejs',
    type: 'threejs'
  },
  {
    name: "threejs-two-models",
    title: "Two models",
    entry: './src/threejs/two-models.ts',
    template: './template-example.ejs',
    type: 'threejs'
  },
  {
    name: "threejs-custom-scene-elements",
    title: "Custom ThreeJS scene elements",
    entry: './src/threejs/custom-scene-elements.ts',
    template: './template-example.ejs',
    type: 'threejs'
  },
  {
    name: "cesiumjs-basic",
    title: 'CesiumJS basic',
    entry: './src/cesiumjs/basic.ts',
    template: './src/cesiumjs/template.ejs',
    type: 'cesium'
  },
];

module.exports = env => {
  const buildCesiumExamples = arg(env, 'cesium', true);
  const buildThreeJsExamples = arg(env, 'threejs', true);
  const development = arg(env, 'development', true);

  logger.info("Build config:");
  logger.info(`  - development: ${development}`);
  logger.info(`  - threejs: ${buildThreeJsExamples}`);
  logger.info(`  - cesium:  ${buildCesiumExamples}`);

  const isExampleEnabled = example => {
    return (example.type === 'cesium' && buildCesiumExamples) ||
      (example.type === 'threejs' && buildThreeJsExamples);
  }
  const enabledExamples = allExamples.filter(isExampleEnabled);

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
  const exampleEntries = examples.reduce((entries, example) => {
    const { entry, name } = example;
    entries[name] = entry;
    return entries;
  }, {});
  const examplePlugins = examples.map(example => {
    const { page, script, title, template } = example;
    return new HtmlWebpackPlugin({
      templateParameters: {
        'title': title,
        'script': script
      },
      hash: true,
      inject: false,
      template: template,
      filename: page,
    });
  });



  return {
    mode: development ? "development" : "production",
    entry: exampleEntries,
    target: "web",
    module: {
      rules: [
        {
          test: /node_modules\/@cognite\/reveal\/dist\/.+\.(js|map)$/, // Consider adding ts
          use: ['source-map-loader'],
          enforce: 'pre',
        },
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              onlyCompileBundledFiles: true,
            },
          },
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
          test: /\.css$/,
          use: [ 'style-loader', 'css-loader' ]
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
    devtool: development ? "inline-cheap-module-source-map" : "source-map",
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
        resolve('node_modules/cesium/Source/')
      ],
      writeToDisk: true,
    },
    optimization: {
      usedExports: true,
    },
    amd: {
      // Enable webpack-friendly use of require in Cesium
      toUrlUndefined: true
    },
    plugins: [
      new CopyWebpackPlugin([
        {from: path.join(revealSource, "**/*.wasm"), to: ".", flatten: true},
        {from: path.join(revealSource, "**/*.worker.js"), to: ".", flatten: true}
      ]),
      new CopyWebpackPlugin([{ from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' } ]),
      new CopyWebpackPlugin([{ from: cesiumSource, to: 'Cesium' } ]),
      new webpack.DefinePlugin({
          CESIUM_BASE_URL: JSON.stringify('/')
      }),

      // Examples and index
      new HtmlWebpackPlugin({
        templateParameters: {
          'examples': examples,
        },
        hash: true,
        inject: false,
        template: 'template-index.ejs',
      }),
      ...examplePlugins
    ],
  };
};
