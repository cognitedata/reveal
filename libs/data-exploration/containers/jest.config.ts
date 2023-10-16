/* eslint-disable */
export default {
  displayName: 'data-exploration-containers',
  preset: '../../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleNameMapper: {
    '@cognite/unified-file-viewer':
      '<rootDir>/../../../node_modules/@cognite/unified-file-viewer/dist/index.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(es-cookie|lodash-es|@cognite/unified-file-viewer))',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/data-exploration/containers',
  collectCoverage: true,
  setupFilesAfterEnv: ['./src/setupTests.js'],
  collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
};
