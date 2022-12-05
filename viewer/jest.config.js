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
      // '^.+\\.(mjs|tsx?)$': ['ts-jest', { useESM: true, tsconfig: path.resolve(__dirname, './tsconfig.test.json') }]
    },
    preset: 'ts-jest/presets/js-with-ts-esm', // or other ESM presets
    testRegex: '(.*\\.test\\..*|\\.(test|spec|Test))\\.tsx?$',
    // extensionsToTreatAsEsm: ['.ts'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    transformIgnorePatterns: ["node_modules/(?!(moq.ts|rxjs|random-seed)/)"],
    moduleNameMapper: {
      '\\.(frag|vert)$': path.resolve(__dirname, './test-utilities/src/filetype-mocks/glslMocks.js'),
      '\\.css$': path.resolve(__dirname, './test-utilities/src/filetype-mocks/cssMock.js'),
      '\\.svg$': path.resolve(__dirname, './test-utilities/src/filetype-mocks/svgMock.js'),
      '\\.wasm$': path.resolve(__dirname, './test-utilities/src/filetype-mocks/wasmMock.js')
    },
    coverageDirectory: './coverage',
    collectCoverageFrom: [
      '!**/.*.test.ts',
      '!**/*.VisualTest.ts',
      '!./packages/*/visual-tests/**',
      '!./visual-tests/**',
      '!./test-utilities/**',
      '!**/*.d.ts',
      '!**/*.json',
      '!**/dist/**/*.*',
      '!**/app/**'
    ],
    automock: false,
    setupFiles: [path.resolve(__dirname, './test-utilities/src/setupJest.ts'), 'jest-canvas-mock'],
    setupFilesAfterEnv: ['jest-extended/all'],
    testEnvironment: 'jsdom'
  };
};
