/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('../jest.react.config.js');

module.exports = {
  ...baseConfig,
  coveragePathIgnorePatterns: ['node_modules', '__tests__', '.stories.'],
  moduleNameMapper: {
    '.+\\.(svg|png|jpg|ttf|woff|woff2)$': [
      '<rootDir>/../../node_modules/jest-transform-stub',
      '<rootDir>/../../../npm/node_modules/jest-transform-stub',
    ],
    '^@cognite/(.*)/dist/mocks$': [
      '../../../packages/$1/src/mocks',
      '../../../packages/$1/dist/mocks',
    ],
    // ...baseConfig.moduleNameMapper,
    '^@cognite/(?!cogs.js|seismic-sdk-js)(.*)$': [
      '../../../packages/$1/src',
      '../../../packages/$1/dist',
      '<rootDir>/packages/$1/src',
      '<rootDir>/packages/$1/dist',
    ],
  },
};
