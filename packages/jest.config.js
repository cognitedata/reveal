module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '.ts': 'ts-jest',
  },
  modulePaths: ['src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'd.ts'],
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  haste: {
    enableSymlinks: true,
  },
  moduleNameMapper: {
    // resolve @cognite/<package>/dist/mocks to
    // 1. @cognite/<package>/src/mocks when running plain jest
    // 2. @cognite/<package>/dist/mocks when running through bazel
    '^@cognite/(.*)/dist/mocks$': [
      '../../../packages/$1/src/mocks',
      '../../../packages/$1/dist/mocks',
    ],
    // we don't want external private packages to be treated as local
    '^@cognite/(?!cogs.js|sdk|cdf-hub-tenant-selector)(.*)$': [
      '../../../packages/$1/src',
      '../../../packages/$1/dist',
      '<rootDir>/../../packages/$1/src',
      '<rootDir>/../../packages/$1/dist',
    ],
  },
};
