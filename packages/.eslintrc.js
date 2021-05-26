module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'plugin:jest/recommended',
    'plugin:react/recommended',
  ],
  plugins: ['import'],
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'jest/expect-expect': [0],
    'jest/no-standalone-expect': [0],
    '@typescript-eslint/explicit-function-return-type': [
      'off',
      {
        allowExpressions: true,
      },
    ],
    'import/order': [
      1,
      {
        'newlines-between': 'always',
        groups: [
          'builtin',
          ['external', 'internal'],
          'parent',
          ['sibling', 'index'],
        ],
      },
    ],
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars-experimental': [
      2,
      {
        ignoredNamesRegex: '^_',
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts?(x)'],
      rules: {
        'react/prop-types': 0,
      },
    },
  ],
};
