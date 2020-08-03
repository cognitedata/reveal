/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('../../../jest.config.js');

module.exports = {
  ...baseConfig,
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx|ts)?$',
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss)$':
      '<rootDir>/node_modules/jest-css-modules-transform',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jest-environment-jsdom-sixteen',
};
