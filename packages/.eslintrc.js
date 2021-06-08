module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'plugin:jest/recommended',
    'plugin:react/recommended',
    '@cognite',
    'plugin:jest-dom/recommended',
    'plugin:testing-library/react',
  ],
  plugins: ['@cognite', 'jest-dom', 'testing-library', 'import'],
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
    '@cognite/no-number-z-index': 'error',
    '@cognite/no-sdk-submodule-imports': 'error',
    '@cognite/styled-macro': ['error', 'forbid'],

    'react/jsx-props-no-spreading': ['off'],
    'react/static-property-placement': ['off'],
    'react/state-in-constructor': ['off'],
    'react/prop-type': ['off'],
    'react/require-default-props': ['off'],

    'jest/expect-expect': ['off'],
    'jest/no-test-callback': ['off'],
    'jest/no-export': ['off'],

    'lodash/prefer-lodash-method': ['off'],
    'lodash/prop-shorthand': ['off'],
    'lodash/prefer-constant': ['off'],
    'lodash/prefer-is-nil': ['off'],
    'lodash/prefer-get': ['off'],

    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars-experimental': [
      2,
      {
        ignoredNamesRegex: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': ['error'],
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
