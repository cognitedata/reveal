/* eslint-disable */
export default {
  displayName: 'entity-matching',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/entity-matching',
  setupFilesAfterEnv: ['./src/app/setupTests.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/app/**/*.{ts,tsx}'],
};
