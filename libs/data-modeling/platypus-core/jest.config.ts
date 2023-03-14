/* eslint-disable */
export default {
  displayName: 'data-modeling-platypus-core',
  preset: '../../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/data-modeling/platypus-core',
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
};
