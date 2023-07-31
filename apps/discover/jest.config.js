/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('../jest.react.config.js');

module.exports = {
  ...baseConfig,
  setupFiles: ['jest-localstorage-mock'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jest-environment-jsdom',
  coveragePathIgnorePatterns: ['node_modules', '__tests__', '.stories.'],
};
