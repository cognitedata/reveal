/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('../jest.config.js');

module.exports = {
  ...baseConfig,
  setupFiles: ['jest-localstorage-mock'],
  testEnvironment: 'jsdom',
};
