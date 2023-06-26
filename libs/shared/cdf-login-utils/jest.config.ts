/* eslint-disable */
export default {
  displayName: 'cdf-login-utils',
  preset: '../../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleNameMapper: {
    '@cognite/unified-file-viewer':
      '<rootDir>/../../../node_modules/@cognite/unified-file-viewer/dist/index.js',
  },
  transformIgnorePatterns: ['node_modules/(?!@cognite/unified-file-viewer)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/shared/cdf-login-utils',
  setupFilesAfterEnv: ['./src/setupTests.js'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
};
