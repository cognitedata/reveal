const baseConfig = require('../.eslintrc');

module.exports = {
  ...baseConfig,
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: 'tsconfig.json',
    sourceType: 'module',
  },
};
