const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const SUBSURFACE_COMPONENTS_PATH = "src/__export__/subsurface-components";
const SUBSURFACE_INTERFACES_PATH = "src/__export__/subsurface-interfaces";
const SUBSURFACE_VISUALIZER_PATH = "src/__export__/subsurface-visualizer";

function resolve(dir) {
  return path.resolve(__dirname, dir);
}

module.exports = (env) => ({
  mode: env.debug === "false" ? "production" : "development",
  entry: {
    "subsurface-visualizer/subsurface-visualizer": `./${SUBSURFACE_VISUALIZER_PATH}/index.ts`,
    "subsurface-components/subsurface-components": `./${SUBSURFACE_COMPONENTS_PATH}/index.ts`,
    "subsurface-interfaces/subsurface-interfaces": `./${SUBSURFACE_INTERFACES_PATH}/index.ts`
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.(ts|js)x?$/,
        include: resolve("src"),
        exclude: /node_modules/,
        use: [
          // {
          //   loader: 'babel-loader',
          // },
          {
            loader: 'ts-loader',
            options: {
              instance: "subsurface-visualizer",
              configFile: resolve(SUBSURFACE_VISUALIZER_PATH + "/tsconfig.json")
          }
          }
        ]
      },
      {
        test: /\.(ts|js)x?$/,
        include: resolve(SUBSURFACE_COMPONENTS_PATH),
        exclude: /node_modules/,
        use: [
          // {
          //   loader: 'babel-loader',
          // },
          {
            loader: 'ts-loader',
            options: {
              instance: "subsurface-Components",
              configFile: resolve(SUBSURFACE_COMPONENTS_PATH + "/tsconfig.json")
            }
          }
        ]
      },
      {
        test: /\.(ts|js)x?$/,
        include: resolve(SUBSURFACE_INTERFACES_PATH),
        exclude: /node_modules/,
        use: [
          // {
          //   loader: 'babel-loader',
          // },
          {
            loader: 'ts-loader',
            options: {
              instance: "subsurface-interfaces",
              configFile: resolve(SUBSURFACE_INTERFACES_PATH + "/tsconfig.json")
            }
          }
        ]
      },
      {
        test: /\.s?css$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192
            }
          }
        ]
      },
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".png", ".svg"],
    alias: {
      "@": resolve("src"),
      "@images": resolve("images"),
      "@cognite/subsurface-components": resolve(SUBSURFACE_COMPONENTS_PATH),
      "@cognite/subsurface-interfaces": resolve(SUBSURFACE_INTERFACES_PATH),
      "@cognite/subsurface-visualizer": resolve(SUBSURFACE_VISUALIZER_PATH)
    }
  },
  output: {
    filename: "[name].js",
    path: resolve("dist"),
    sourceMapFilename: "[name].map",
    library: "[name]",
    libraryTarget: "umd"
  },
  devtool: env.debug === "false" ? undefined : "inline-source-map",
  optimization: {
    minimize: env.debug === "false" ? true : false
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new CopyPlugin({
      patterns: [
        { context: resolve(SUBSURFACE_VISUALIZER_PATH),
          from: "package.json",
          to: resolve("dist/subsurface-visualizer")
        },
        { context: resolve(SUBSURFACE_VISUALIZER_PATH),
          from: "README.md",
          to: resolve("dist/subsurface-visualizer") },
        {
          context: resolve(SUBSURFACE_COMPONENTS_PATH),
          from: "package.json",
          to: resolve("dist/subsurface-components")
        },
        {
          context: resolve(SUBSURFACE_COMPONENTS_PATH),
          from: "README.md",
          to: resolve("dist/subsurface-components")
        },
        {
          context: resolve(SUBSURFACE_INTERFACES_PATH),
          from: "package.json",
          to: resolve("dist/subsurface-interfaces")
        },
        {
          context: resolve(SUBSURFACE_INTERFACES_PATH),
          from: "README.md",
          to: resolve("dist/subsurface-interfaces")
        }
      ]
    })
  ],
  externals: [{
    react: {
      root: "React",
      commonjs2: "react",
      commonjs: "react",
      amd: "react",
      umd: "react"
    },
    "react-dom": {
      root: "ReactDOM",
      commonjs2: "react-dom",
      commonjs: "react-dom",
      amd: "react-dom",
      umd: "react-dom"
    },
    redux: "redux",
    "react-redux": "react-redux",
    // "three": "three",
    // "fabric": "fabric"
  },
    /@material-ui\/[a-z,\/]*/i]
});
