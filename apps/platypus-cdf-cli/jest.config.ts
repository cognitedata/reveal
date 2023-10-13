/* eslint-disable */
export default {
  displayName: 'platypus-cdf-cli',
  preset: '../../jest.preset.js',
  globals: {},
  testEnvironment: 'node',
  moduleNameMapper: {
    // See https://github.com/uuidjs/uuid/issues/451
    '^uuid$': 'uuid',
  },
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/platypus-cdf-cli',
  collectCoverage: true,
  collectCoverageFrom: ['./src/app/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: ['codegen-static'],
};