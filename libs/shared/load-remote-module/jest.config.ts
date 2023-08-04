/* eslint-disable */
export default {
  displayName: 'load-remote-module',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/load-remote-module',
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
};
