/* eslint-disable */
export default {
  displayName: 'mock-server',
  preset: '../../jest.preset.js',
  globals: {},
  moduleNameMapper: { '^uuid$': 'uuid' },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/mock-server',
  collectCoverage: true,
  collectCoverageFrom: ['./src/app/**/*.{ts,tsx}'],
};
