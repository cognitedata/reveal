const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const NODE_VISUALIZER_COMPONENTS_PATH =
  "src/__export__/node-visualizer-components";
const NODE_VISUALIZER_SUBSURFACE_PATH =
  "src/__export__/node-visualizer-subsurface";
const NODE_VISUALIZER_PATH = "src/__export__/node-visualizer";

function resolve(dir) {
  return path.resolve(__dirname, dir);
}

module.exports = (env) => ({
  mode: env.debug === "false" ? "production" : "development",
  entry: {
    "node-visualizer/node-visualizer": `./${NODE_VISUALIZER_PATH}/index.ts`,
    "node-visualizer-components/node-visualizer-components": `./${NODE_VISUALIZER_COMPONENTS_PATH}/index.ts`,
    "node-visualizer-subsurface/node-visualizer-subsurface": `./${NODE_VISUALIZER_SUBSURFACE_PATH}/index.ts`,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /\.(ts|js)x?$/,
        include: resolve("src"),
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              instance: "node-visualizer",
              configFile: resolve(`${NODE_VISUALIZER_PATH}/tsconfig.json`),
            },
          },
        ],
      },
      {
        test: /\.(ts|js)x?$/,
        include: resolve(NODE_VISUALIZER_COMPONENTS_PATH),
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              instance: "node-visualizer-components",
              configFile: resolve(
                `${NODE_VISUALIZER_COMPONENTS_PATH}/tsconfig.json`
              ),
            },
          },
        ],
      },
      {
        test: /\.(ts|js)x?$/,
        include: resolve(NODE_VISUALIZER_SUBSURFACE_PATH),
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              instance: "node-visualizer-subsurface",
              configFile: resolve(
                `${NODE_VISUALIZER_SUBSURFACE_PATH}/tsconfig.json`
              ),
            },
          },
        ],
      },
      {
        test: /\.((c|sa|sc)ss)$/i,
        use: [
          env.debug === "true" ? "style-loader" : MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              // Run `postcss-loader` on each CSS `@import`, do not forget that `sass-loader` compile non CSS `@import`'s into a single file
              // If you need run `sass-loader` and `postcss-loader` on each CSS `@import` please set it to `2`
              importLoaders: 1,
              // Automatically enable css modules for files satisfying `/\.module\.\w+$/i` RegExp.
              modules: { auto: false },
              sourceMap: env.debug === "true",
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: env.debug === "true",
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".scss", ".ts", ".js", ".png", ".svg"],
    alias: {
      "@": resolve("src"),
      "@images": resolve("images"),
      "@cognite/node-visualizer-components": resolve(
        NODE_VISUALIZER_COMPONENTS_PATH
      ),
      "@cognite/node-visualizer-subsurface": resolve(
        NODE_VISUALIZER_SUBSURFACE_PATH
      ),
      "@cognite/node-visualizer": resolve(NODE_VISUALIZER_PATH),
    },
  },
  output: {
    filename: "[name].js",
    path: resolve("dist"),
    sourceMapFilename: "[name].map",
    library: "[name]",
    libraryTarget: "umd",
  },
  devtool: env.debug === "false" ? undefined : "inline-source-map",
  optimization: {
    minimize: env.debug === "false",
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new CopyPlugin({
      patterns: [
        {
          context: resolve(NODE_VISUALIZER_PATH),
          from: "package.json",
          to: resolve("dist/node-visualizer"),
        },
        {
          context: resolve(NODE_VISUALIZER_PATH),
          from: "README.md",
          to: resolve("dist/node-visualizer"),
        },
        {
          context: resolve(NODE_VISUALIZER_COMPONENTS_PATH),
          from: "package.json",
          to: resolve("dist/node-visualizer-components"),
        },
        {
          context: resolve(NODE_VISUALIZER_COMPONENTS_PATH),
          from: "README.md",
          to: resolve("dist/node-visualizer-components"),
        },
        {
          context: resolve(NODE_VISUALIZER_SUBSURFACE_PATH),
          from: "package.json",
          to: resolve("dist/node-visualizer-subsurface"),
        },
        {
          context: resolve(NODE_VISUALIZER_SUBSURFACE_PATH),
          from: "README.md",
          to: resolve("dist/node-visualizer-subsurface"),
        },
      ],
    }),
  ],
  externals: [
    {
      react: {
        root: "React",
        commonjs2: "react",
        commonjs: "react",
        amd: "react",
        umd: "react",
      },
      "react-dom": {
        root: "ReactDOM",
        commonjs2: "react-dom",
        commonjs: "react-dom",
        amd: "react-dom",
        umd: "react-dom",
      },
      redux: "redux",
      "react-redux": "react-redux",
    },
    /@material-ui\/[a-z,/]*/i,
  ],
});
