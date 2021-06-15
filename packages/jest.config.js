module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '.ts': 'ts-jest',
  },
  modulePaths: ['src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  moduleNameMapper: {
    // resolve @cognite/<package>/mocks to
    // 1. @cognite/<package>/mocks/src when running plain jest
    // 2. @cognite/<package>/mocks/src when running through bazel
    '^@cognite/(.*)/mocks$': [
      '../../../packages/$1/src/mocks',
      '../../../packages/$1/dist/mocks',
    ],
    // we don't want external private packages to be treated as local
    '^@cognite/(?!cogs.js|sdk|testing)(.*)$': [
      '../../../packages/$1/src',
      '../../../packages/$1/dist',
      '<rootDir>/../../packages/$1/src',
      '<rootDir>/../../packages/$1/dist',
    ],
  },
};
