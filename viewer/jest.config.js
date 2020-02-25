module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*(test|spec|Test).*|(\\.|/)(test|spec|Test))\\.tsx?$',
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/src/$1',
    '\\.(frag|vert)$': '<rootDir>/src/__mocks__/glslMocks.js',
  },
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    "src/",
    "!src/__tests__/**/*.ts"
  ],
  automock: false,
  setupFiles: [
    "./src/__tests__/setupJest.ts",
    "jest-canvas-mock"
  ],
  setupFilesAfterEnv: [
    "jest-extended"
  ],
};
