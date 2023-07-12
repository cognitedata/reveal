/* eslint-disable */
export default {
  displayName: 'document-search',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/cdf-document-search',
  setupFilesAfterEnv: ['./src/setupTests.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/app/**/*.{ts,tsx}'],
};
