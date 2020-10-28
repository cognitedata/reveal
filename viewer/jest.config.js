/*!
 * Copyright 2020 Cognite AS
 */

process.env.VERSION = 'test';
process.env.MIXPANEL_TOKEN = 'test';

module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*\\.test\\..*|\\.(test|spec|Test))\\.tsx?$',
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '\\.(frag|vert)$': '<rootDir>/src/__mocks__/glslMocks.js',
    '\\.css$': '<rootDir>/src/__mocks__/cssMock.js',
    '^@/(.*)': '<rootDir>/src/$1'
  },
  globals: {
    __webpack_public_path__: '',
    'ts-jest': {
      tsConfig: 'tsconfig.test.json'
    }
  },
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['!src/__tests__/**/*.ts', '!**/*.d.ts', '!**/*.json'],
  automock: false,
  setupFiles: ['./src/__tests__/setupJest.ts', 'jest-canvas-mock', 'core-js'],
  setupFilesAfterEnv: ['jest-extended']
};
