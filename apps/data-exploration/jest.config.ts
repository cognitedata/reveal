export default {
  displayName: 'data-exploration',
  preset: './jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
    'd3(.*)': '<rootDir>/../../node_modules/d3$1/dist/d3$1.min.js',
    '@cognite/plotting-components':
      '<rootDir>/../../libs/shared/plotting-components/src',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/data-exploration',
  setupFilesAfterEnv: ['./src/setupTests.js'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/app/**/*.{ts,tsx}'],
};
