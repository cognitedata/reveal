/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('../../jest.config.js');

const pack = require('./package');

module.exports = {
  ...baseConfig,
  displayName: pack.name,
  name: pack.name,
};
