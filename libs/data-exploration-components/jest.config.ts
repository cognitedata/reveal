export default {
  displayName: 'data-exploration-components',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!d3|d3-array|internmap|delaunator|robust-predicates|@cognite/unified-file-viewer)"
  ],
  moduleNameMapper: {
    'canvas': 'jest-canvas-mock',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/data-exploration-components',
};
