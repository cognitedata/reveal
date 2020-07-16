/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('../../../../jest.config.js');

const pack = require('./package');

module.exports = {
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss)$':
      '<rootDir>/node_modules/jest-css-modules-transform',
  },
  ...baseConfig,
  testEnvironment: 'jsdom',
  displayName: pack.name,
  name: pack.name,
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
