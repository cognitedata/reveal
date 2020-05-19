const path = require("path");
module.exports = {
  // webpack will take the files from ./src/index
  entry: "./src/UserInterface/views/App.tsx",

  // and output it into /dist as bundle.js
  output: {
    path: path.resolve("lib"),
    filename: "SubsurfaceVisualizer.js",
  },

  // adding .ts and .tsx to resolve.extensions will help babel look for .ts and .tsx files to transpile
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },

  module: {
    rules: [
      // use babel-loader to load our tsx files
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      // sass-loader to bundle all the css files into one file and style-loader to add all the styles  inside the style tag of the document
      {
        test: /\.s?css$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              esModule: false,
            },
          },
        ],
      },
    ],
  },
};
