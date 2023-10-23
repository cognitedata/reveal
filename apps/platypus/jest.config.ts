/* eslint-disable */
const esModules = ['d3', 'd3-array', 'monaco', 'monaco-editor'].join('|');

export default {
  displayName: 'platypus',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/platypus',
  setupFilesAfterEnv: ['./src/app/setupTests.ts'],
  codeCoverage: true,
  collectCoverageFrom: ['./src/app/**/*.{ts,tsx}', '!./src/app/CorsWorker.ts'],
  silent: true,
  moduleNameMapper: {
    'd3(.*)': '<rootDir>/../../node_modules/d3$1/dist/d3$1.min.js',
  },
};
