/* eslint-disable @typescript-eslint/no-var-requires */
const crypto = require('crypto');

const baseConfig = require('../jest.react.config.js');

module.exports = {
  ...baseConfig,
  globals: {
    crypto,
  },
};
