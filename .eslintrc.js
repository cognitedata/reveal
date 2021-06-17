module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  extends: [
    '@cognite',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest-dom/recommended',
    'plugin:lodash/recommended',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'plugin:testcafe/recommended',
    'plugin:testing-library/react',
    'prettier/@typescript-eslint',
  ],
  plugins: ['@cognite', 'testing-library', 'lodash', 'testcafe', 'jest-dom'],
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@cognite/no-unissued-todos': [
      'error',
      { issuePattern: '\\(((CG|DEMO|DTC|CM)-[0-9]+)\\)' },
    ],

    'react/jsx-props-no-spreading': ['off'],
    'react/static-property-placement': ['off'],
    'react/state-in-constructor': ['off'],
    'react/react-in-jsx-scope': ['off'],
    'react/jsx-uses-react': ['off'],
    'react/display-name': ['off'],

    'react-hooks/exhaustive-deps': ['off'],

    'jest/expect-expect': ['off'],
    'jest/no-test-callback': ['off'],
    'jest/no-export': ['off'],
    'jest/no-standalone-expect': ['off'],

    'lodash/prefer-lodash-method': ['off'],
    'lodash/prefer-lodash-typecheck': ['off'],
    'lodash/prop-shorthand': ['off'],
    'lodash/prefer-constant': ['off'],
    'lodash/prefer-is-nil': ['off'],
    'lodash/prefer-get': ['off'],
    'lodash/prefer-includes': ['off'],

    '@typescript-eslint/explicit-function-return-type': [
      'off',
      {
        allowExpressions: true,
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': ['off'],
    '@typescript-eslint/no-unused-vars': ['off'],
    '@typescript-eslint/no-unused-vars-experimental': [
      2,
      {
        ignoredNamesRegex: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-non-null-assertion': ['off'],

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
    'no-shadow': 0,
    'max-classes-per-file': ['off'],
    'lines-between-class-members': ['off'],
    'class-methods-use-this': ['off'],
  },
  overrides: [
    {
      files: ['*.ts?(x)'],
      rules: {
        'react/prop-types': ['off'],
        'react/require-default-props': ['off'],
      },
    },
  ],
};
