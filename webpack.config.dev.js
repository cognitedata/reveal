const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

function resolve(dir) {
  return path.resolve(__dirname, dir);
}

module.exports = {
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
      "@images": resolve("images")
    }
  },

  module: {
    rules: [
      // use babel-loader to load our tsx files
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
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
  devtool: "inline-source-map"
};
