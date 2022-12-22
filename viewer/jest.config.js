/*!
 * Copyright 2021 Cognite AS
 */

const path = require('path');

process.env.VERSION = 'test';
process.env.MIXPANEL_TOKEN = 'test';

const { jsWithTsESM: spec } = require('ts-jest/presets');

spec.transform['^.+\\.m?[tj]sx?$'][1].tsconfig = 'tsconfig.test.json';

module.exports = () => {
  return {
    rootDir: '.',
    roots: ['<rootDir>'],
    extensionsToTreatAsEsm: spec.extensionsToTreatAsEsm,
    transform: {
      ...spec.transform,
    },
    testRegex: '(.*\\.test\\..*|\\.(test|spec|Test))\\.tsx?$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    // Transform certain packages that don't export commonJS
    transformIgnorePatterns: ['node_modules/(?!(moq.ts|rxjs|random-seed)/)'],
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
