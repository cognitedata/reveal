/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('../jest.react.config.js');

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    '.+\\.(svg|css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
      '<rootDir>/../../../npm/node_modules/jest-transform-stub',
    ...baseConfig.moduleNameMapper,
  },
};
