export default {
  displayName: 'data-exploration-components',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
    'd3(.*)': '<rootDir>/../../node_modules/d3$1/dist/d3$1.min.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/data-exploration-components',
};
