/* eslint-disable */
export default {
  displayName: 'functions-ui',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/functions-ui',
  collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
  setupFilesAfterEnv: ['./setupTests.js'],
};
