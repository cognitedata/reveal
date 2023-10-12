// List esm only packages that're used in tests
const esmPackages = ['react-markdown'].join('|');

export default {
  displayName: 'extraction-pipelines',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  transformIgnorePatterns: [
    `../../node_modules/(?!${esmPackages})`,
    'jest-runner',
  ],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/extraction-pipelines',
  setupFilesAfterEnv: ['./src/setupTests.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/app/**/*.{ts,tsx,js,jsx}'],
};
