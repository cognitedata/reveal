const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function resolve(dir) {
  return path.resolve(__dirname, dir);
}

module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials'
  ],
  webpackFinal: async (config, { configType }) => {
    const aliases = {
      '@': resolve('../src'),
      '@images': resolve('../images'),
      '@cognite/node-visualizer': resolve('../dist'),
    }

    config.module.rules.push(
      {
        test: /\.(ts|tsx)$/,
        include: resolve('../src'),
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: resolve(`../tsconfig.json`),
            },
          },
          {
            loader: require.resolve('react-docgen-typescript-loader'),
            options: {
              tsconfigPath: resolve('../tsconfig.json'),
            },
          },
        ]
      },
    )

    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          ...aliases,
        },
      },
    };
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
  },
}