/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('../jest.config.js');

module.exports = {
  ...baseConfig,
  testEnvironment: 'jest-environment-jsdom',
};
