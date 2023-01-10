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
    preset: 'ts-jest/presets/js-with-ts-esm',
    testRegex: '(.*\\.test\\..*|\\.(test|spec|Test))\\.tsx?$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    // Transform certain packages that don't export commonJS
    transformIgnorePatterns: ['node_modules/(?!(moq.ts|rxjs|random-seed)/)'],
    moduleNameMapper: {
      '\\.(frag|vert)$': path.resolve(__dirname, './test-utilities/src/filetype-mocks/glslMocks.js'),
      '\\.css$': path.resolve(__dirname, './test-utilities/src/filetype-mocks/cssMock.js'),
      '\\.svg$': path.resolve(__dirname, './test-utilities/src/filetype-mocks/svgMock.js'),
      '\\.wasm$': path.resolve(__dirname, './test-utilities/src/filetype-mocks/wasmMock.js'),
        // Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports. See https://github.com/uuidjs/uuid/issues/451
        // https://stackoverflow.com/a/73203803
        "uuid": require.resolve('uuid'),
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
