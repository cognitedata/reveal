const baseConfig = require('../../.eslintrc');

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    // We can extend apps rules below
    '@typescript-eslint/no-unused-vars': ['off'],
    'react/prop-types': ['off'],
    'no-unused-expressions': ['off'],
    'typescript-eslint/no-unused-vars': ['off'],
    'import/order': ['warn'],
    'no-param-reassign': ['off'],
  },
};
