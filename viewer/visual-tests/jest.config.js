/*!
 * Copyright 2022 Cognite AS
 */
const path = require('path');

module.exports = {
  preset: 'jest-puppeteer',
  testRegex: 'VisualTests.ts',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  globals: {
    __webpack_public_path__: '',
    'ts-jest': {
      tsconfig: path.resolve(__dirname, '../tsconfig.test.json')
    }
  },
  rootDir: '.',
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  testEnvironment: 'jest-environment-puppeteer',
  setupFilesAfterEnv: [path.resolve(__dirname, './setupTests.ts')],
  testTimeout: 80 * 1000 // typical test ~5s, so 5*retryTimes should be less than timeout or test will fail during retry
};
