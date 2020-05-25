const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

function resolve(dir) {
  return path.resolve(__dirname, dir);
}

module.exports = {
  mode: "production",
  entry: {
    "subsurface-visualizer": "./src/index.ts"
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.s?css$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              esModule: false,
              outputPath: "assets"
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".png", ".svg"],
    alias: {
      "@": resolve("src"),
      "@images": resolve("images")
    }
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    sourceMapFilename: "[name].map",
    library: "[name]",
    libraryTarget: "umd"
  },
  devtool: "false",
  plugins: [
    new CleanWebpackPlugin()
    //  new BundleAnalyzerPlugin()
  ],
  externals: {
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
    "react-redux": "react-redux"
  }
};
