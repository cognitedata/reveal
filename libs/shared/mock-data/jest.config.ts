/* eslint-disable */
export default {
  displayName: 'shared-mock-data',
  preset: '../../../jest.preset.js',
  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/shared/mock-data',
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
};