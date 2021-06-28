/*!
 * Copyright 2021 Cognite AS
 */

process.env.VERSION = 'test';
process.env.MIXPANEL_TOKEN = 'test';

module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(.*\\.test\\..*|\\.(test|spec|Test))\\.tsx?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '\\.(frag|vert)$': '<rootDir>/src/__mocks__/glslMocks.js',
    '\\.css$': '<rootDir>/src/__mocks__/cssMock.js',
    '\\.svg$': '<rootDir>/src/__mocks__/svgMock.js'
  },
  globals: {
    __webpack_public_path__: '',
    // process.env globals are in setupJest
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['!src/__testutilities__/**/*.ts', '!**/.*.test.ts', '!**/*.d.ts', '!**/*.json'],
  automock: false,
  setupFiles: ['./src/__testutilities__/setupJest.ts', 'jest-canvas-mock', 'core-js'],
  setupFilesAfterEnv: ['jest-extended']
};
