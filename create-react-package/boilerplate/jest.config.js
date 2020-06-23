module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx|ts)?$',
  moduleFileExtensions: ['ts', 'js', 'tsx', 'json', 'node'],
  coverageDirectory: './coverage/',
  collectCoverage: true,
  moduleNameMapper: {
    ".+\\.(css|styl|less|sass|scss)$": "<rootDir>/node_modules/jest-css-modules-transform",
  }
};
