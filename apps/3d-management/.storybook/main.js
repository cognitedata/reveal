// .storybook/main.js

import path from 'path';

const MOCKS_DIRECTORY = '__mocks__';
const MOCKS_DIRECTORY_PATH = path.resolve(
  __dirname,
  '..',
  'src',
  MOCKS_DIRECTORY
);
const MOCKED_MODULES = [];

export default {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  staticDirs: ['../public'],
  addons: ['@storybook/preset-create-react-app'],
  docs: {
    autodocs: 'tag',
  },
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  babel: async (options) => ({
    // Update your babel configuration here
    ...options,
  }),

  webpackFinal: async (config, { configType }) => {
    MOCKED_MODULES.forEach((moduleName) => {
      config.resolve.alias[moduleName] = path.join(
        MOCKS_DIRECTORY_PATH,
        moduleName
      );
    });

    return config;
  },
};
