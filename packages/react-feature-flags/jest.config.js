/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('../jest.react.config.js');

module.exports = {
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx|ts)?$',
  ...baseConfig,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
