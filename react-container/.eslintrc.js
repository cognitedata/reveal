const baseConfig = require('../.eslintrc');

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    'react/require-default-props': [0],
  },
};
