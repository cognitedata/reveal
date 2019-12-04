module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*(test|spec|Test).*|(\\.|/)(test|spec|Test))\\.tsx?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    "!src/__tests__/**/*.ts"
  ],
  automock: false,
  setupFiles: [
    "./src/__tests__/setupJest.ts",
    "jest-canvas-mock"
  ],
  setupFilesAfterEnv: [
    "jest-extended"
  ]
};
