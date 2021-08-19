module.exports = {
  extends: [
    '@cognite',
    'plugin:testing-library/react',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['@cognite', 'testing-library'],
  rules: {
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: 'useRecoilCallback|useRecoilTransaction_UNSTABLE',
      },
    ],
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    '@cognite/no-unissued-todos': [
      'error',
      { issuePattern: '\\(((DEMO)-[0-9]+)\\)' },
    ],
    'no-param-reassign': ['error', { props: false }],
    'react/require-default-props': ['off'],
    'max-classes-per-file': ['off'],
    'lines-between-class-members': ['off'],
    'class-methods-use-this': ['off'],

    'react/jsx-props-no-spreading': ['off'],
    'react/static-property-placement': ['off'],
    'react/state-in-constructor': ['off'],
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',

    'jest/expect-expect': ['off'],
    'jest/no-test-callback': ['off'],
    'jest/no-export': ['off'],

    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars-experimental': [
      'error',
      { ignoredNamesRegex: '^_' },
    ],
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'es5',
        arrowParens: 'always',
        endOfLine: 'auto',
      },
    ],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['**/*.tsx'],
      rules: {
        'react/prop-types': 'off',
      },
    },
  ],
};
