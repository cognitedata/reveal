/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('../../../jest.config.js');

module.exports = {
  ...baseConfig,
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx|ts)?$',
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss)$':
      // We have to traverse all the way up to the root node_modules in order
      // to fetch this dependency correctly.
      '<rootDir>/../../../../node_modules/jest-css-modules-transform',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jest-environment-jsdom-sixteen',
};
