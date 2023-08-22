import path from 'path';
import { fileURLToPath } from 'url';
import TerserPlugin from 'terser-webpack-plugin';
import nodeExternals from 'webpack-node-externals';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default (_, argv) => {
  const { mode } = argv;
  const isProduction = mode === 'production';
  return {
    entry: './src/index.ts',
    output: {
      path: path.resolve(dirname, 'dist'),
      filename: 'index.js',
      clean: false,
      libraryTarget: 'module'
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            onlyCompileBundledFiles: true
          }
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    externals: [
      nodeExternals({
        importType: 'module'
      })
    ],
    resolve: {
      extensions: ['.tsx', '.ts']
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false
            }
          },
          extractComments: false
        })
      ]
    },
    experiments: {
      outputModule: true
    }
  };
};
