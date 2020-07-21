/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('../../../../jest.config.js');

const pack = require('./package');

module.exports = {
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx|ts)?$',
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss)$':
      '<rootDir>/node_modules/jest-css-modules-transform',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  ...baseConfig,
  testEnvironment: 'jsdom',
  displayName: pack.name,
  name: pack.name,
};
