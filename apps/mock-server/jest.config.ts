/* eslint-disable */
export default {
  displayName: 'mock-server',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  moduleNameMapper:{"^uuid$": "uuid"},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/mock-server',
  collectCoverage: true,
  collectCoverageFrom: ['./src/app/**/*.{ts,tsx}'],
};
