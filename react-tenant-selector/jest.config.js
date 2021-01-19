/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('../jest.config.js');

const pack = require('./package');

module.exports = {
  ...baseConfig,
  displayName: pack.name,
  name: pack.name,
  moduleNameMapper: {
    '.+\\.(svg|css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
    '.+\\.(css|styl|less|sass|scss)$':
      // We have to traverse all the way up to the root node_modules in order
      // to fetch this dependency correctly.
      '<rootDir>/../../../../node_modules/jest-css-modules-transform',
  },
};
