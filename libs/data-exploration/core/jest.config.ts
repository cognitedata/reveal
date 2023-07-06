/* eslint-disable */
export default {
  displayName: 'data-exploration-core',
  preset: '../../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/data-exploration/core',
  collectCoverage: true,
  setupFilesAfterEnv: ['./src/setupTests.js'],
  collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
};
