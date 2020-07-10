const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');

const SUBSURFACE_COMPONENTS_PATH = "src/Components";

function resolve(dir) {
  return path.resolve(__dirname, dir);
}

module.exports = (env) => ({
  mode: "development",
  // webpack will take the files from ./src/index
  entry: "./src/UserInterface/index",

  // and output it into /dist as bundle.js
  output: {
    path: path.join(__dirname, "UserInterface", "/dist"),
    filename: "bundle.js"
  },

  // adding .ts and .tsx to resolve.extensions will help babel look for .ts and .tsx files to transpile
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".png", ".svg"],
    alias: {
      "@": resolve("src"),
      "@images": resolve("images"),
      "@cognite/subsurface-components": resolve(SUBSURFACE_COMPONENTS_PATH)
    }
  },

  module: {
    rules: [
      // use babel-loader to load our tsx files
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      // sass-loader to bundle all the css files into one file and style-loader to add all the styles  inside the style tag of the document
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
              esModule: false
            }
          }
        ]
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin()],
  devtool: "source-map"
});
