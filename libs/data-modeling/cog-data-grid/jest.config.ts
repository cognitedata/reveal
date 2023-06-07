/* eslint-disable */
export default {
  displayName: 'data-modeling-cog-data-grid',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/data-modeling/cog-data-grid',
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
};
