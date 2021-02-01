const path = require("path");
const { DefinePlugin } = require("webpack");
const { publicPath, getWorkerCdnUrl, cdnBuildOutputPath, getEnvArg } = require("./buildUtils");
const logger = require("webpack-log")("parser-worker");

const createBaseConfig = (env) => {
  const development = getEnvArg(env, "development", false);

  return {
    mode: development ? "development" : "production",
    experiments: {
      syncWebAssembly: true,
    },
    target: "webworker",
    entry: {
      "reveal.parser.worker": "./index.ts",
    },
    output: {
      filename: '[name].js',
      sourceMapFilename: '[name].map',
      libraryTarget: 'umd'
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      symlinks: false
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: ["ts-loader"],
        },
      ],
    },
    devtool: development && "inline-source-map",
    plugins: [
      new DefinePlugin({
        VERSION: JSON.stringify(require('./package.json').version)
      })
    ]
  };
};

const createLocalBuildConfig = (env) => {
  const localConfig = createBaseConfig(env);

  localConfig.output.path = path.join(__dirname, '/dist/local/');
  localConfig.output.publicPath = publicPath;

  logger.info("Worker local build config:");
  logger.info({ publicPath }); // don't print too much here since it mentioned in docs

  return localConfig;
};

const createCdnConfig = (env) => {
  const cdnConfig = createBaseConfig(env);
  const workerCDNPath = getWorkerCdnUrl();

  cdnConfig.output.path = path.join(__dirname, cdnBuildOutputPath);
  cdnConfig.output.publicPath = workerCDNPath;

  logger.info("Worker CDN build config:");
  logger.info({ env, workerCDNPath });

  return cdnConfig;
};

module.exports = [createLocalBuildConfig, createCdnConfig];
