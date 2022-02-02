const baseConfig = require('../.eslintrc');

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    // We can extend package rules below
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement'],

    // to be enabled
    '@cognite/no-number-z-index': ['off'],
    '@cognite/no-unissued-todos': ['off'],
    '@typescript-eslint/ban-ts-comment': ['off'],
    '@typescript-eslint/ban-types': ['off'],
    '@typescript-eslint/default-param-last': ['off'],
    '@typescript-eslint/no-empty-function': ['off'],
    '@typescript-eslint/no-inferrable-types': ['off'],
    '@typescript-eslint/no-this-alias': ['off'],
    'import/order': ['off'],
    'jest/no-conditional-expect': ['off'],
    'jest/no-mocks-import': ['off'],
    'lodash/prefer-matches': ['off'],
    'no-bitwise': ['off'],
    'no-console': ['off'],
    'no-continue': ['off'],
    'no-param-reassign': ['off'],
    'no-plusplus': ['off'],
    'no-underscore-dangle': ['off'],
    'no-useless-concat': ['off'],
    'no-unreachable-loop': ['off'],
    'testing-library/render-result-naming-convention': ['off'],
  },
};
