const baseConfig = require('../.eslintrc');

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    // packages should never use macro
    '@cognite/styled-macro': ['error', 'forbid'],
  },
};
