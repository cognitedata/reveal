/*!
 * Copyright 2021 Cognite AS
 */

const path = require('path');

process.env.VERSION = 'test';
process.env.MIXPANEL_TOKEN = 'test';

module.exports = () => {
  return {
    rootDir: '.',
    roots: ['<rootDir>'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest'
    },
    testRegex: '(.*\\.test\\..*|\\.(test|spec|Test))\\.tsx?$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    moduleNameMapper: {
      '\\.(frag|vert)$': path.resolve(__dirname, './core/src/__mocks__/glslMocks.js'),
      '\\.css$': path.resolve(__dirname, './core/src/__mocks__/cssMock.js'),
      '\\.svg$': path.resolve(__dirname, './core/src/__mocks__/svgMock.js')
    },
    globals: {
      __webpack_public_path__: '',
      // process.env globals are in setupJest
      'ts-jest': {
        tsconfig: path.resolve(__dirname, './tsconfig.test.json')
      }
    },
    coverageDirectory: './coverage',
    collectCoverageFrom: ['!**/.*.test.ts', '!**/*.d.ts', '!**/*.json', '!**/dist/**/*.*', '!**/app/**'],
    automock: false,
    setupFiles: [path.resolve(__dirname, './test-utilities/src/setupJest.ts'), 'jest-canvas-mock', 'core-js'],
    setupFilesAfterEnv: ['jest-extended'],
    testEnvironment: 'jsdom'
  };
};
