const baseConfig = require('../../.eslintrc');

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    // We can extend apps rules below
  },
};
