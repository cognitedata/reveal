/* eslint-disable */
export default {
  displayName: 'data-exploration-domain-layer',
  preset: '../../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/data-exploration/domain-layer',
  setupFilesAfterEnv: ['./src/setupTests.js'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
};
