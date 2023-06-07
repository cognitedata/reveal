export default {
  displayName: 'interactive-diagrams',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/interactive-diagrams',
  setupFilesAfterEnv: ['./src/app/setupTests.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/app/**/*.{ts,tsx}'],
  moduleNameMapper: {
    'd3(.*)': '<rootDir>/../../node_modules/d3$1/dist/d3$1.min.js',
  },
};
