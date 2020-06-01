const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

function resolve(dir) {
  return path.resolve(__dirname, dir);
}

module.exports = {
  mode: "none",
  entry: "./src/main.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
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
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".png", ".svg"],
    alias: {
      "@": resolve("src"),
      "@images": resolve("images")
    }
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    sourceMapFilename: "[name].map"
  },
  devtool: "inline-source-map",
  devServer: {
    https: false,
    writeToDisk: true,
    contentBase: [resolve("public/")]
  },
  plugins: [new HtmlWebpackPlugin()]
};
