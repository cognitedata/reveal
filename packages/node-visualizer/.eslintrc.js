const baseConfig = require('../.eslintrc');

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    // We can extend package rules below
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement'],
  },
};
