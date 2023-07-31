/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('../jest.react.config.js');

module.exports = {
  ...baseConfig,
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': '../babelTransform.js',
  },
};
