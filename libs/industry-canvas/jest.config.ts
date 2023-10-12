/* eslint-disable */
export default {
  displayName: 'industry-canvas',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: ['@nx/react/babel'],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],

  moduleNameMapper: {
    'd3(.*)': '<rootDir>/../../node_modules/d3$1/dist/d3$1.min.js',
    '@cognite/plotting-components':
      '<rootDir>/../../libs/shared/plotting-components/src',
  },
  transformIgnorePatterns: [
    'node_modules/(?!sparse-octree|three|@cognite/unified-file-viewer)',
  ],
  coverageDirectory: '../../coverage/libs/industry-canvas',
  setupFilesAfterEnv: ['./setupTests.js'],
};
