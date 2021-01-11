/*!
 * Copyright 2021 Cognite AS
 */

module.exports = {
  roots: ['<rootDir>/'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/.*\\.test\\..*|\\.(test|spec|Test))\\.tsx?$',
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  globals: {
    __webpack_public_path__: '',
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['!src/.*\\.test\\..*\\.ts', '!**/*.d.ts', '!**/*.json'],
  automock: false,
  setupFiles: ['core-js']
};
