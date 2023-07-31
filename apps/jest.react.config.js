/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx|ts)?$',
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '.+\\.(svg|png|jpg|ttf|woff|woff2)$': [
      '<rootDir>/../../node_modules/jest-transform-stub',
      '<rootDir>/../../../npm/node_modules/jest-transform-stub',
    ],
    '.+\\.(css|styl|less|sass|scss)$': [
      // resolve paths for
      // 1. when running plain jest
      // 2. when running through bazel
      '<rootDir>/../../node_modules/jest-css-modules-transform',
      '<rootDir>/../../../npm/node_modules/jest-css-modules-transform',
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': '../babelTransform.js',
  },
  // globals: {
  //   'ts-jest': {
  //     babelConfig: {
  //       presets: [
  //         [
  //           'babel-preset-react-app',
  //           {
  //             runtime: 'automatic',
  //           },
  //         ],
  //       ],
  //       babelrc: false,
  //       configFile: false,
  //     },
  //   },
  // },
};
