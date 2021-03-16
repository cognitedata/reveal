module.exports = {
  extends: [
    '@cognite',
    'plugin:testing-library/react',
  ],
  plugins: ['@cognite', 'testing-library'],
  rules: {
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

    'jest/expect-expect': ['off'],
    'jest/no-test-callback': ['off'],
    'jest/no-export': ['off'],


    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars-experimental': [
      2,
      {
        ignoredNamesRegex: '^_',
      },
    ],
    "prettier/prettier": [
      "error",
      {
        "singleQuote": true,
        "trailingComma": "es5",
        "arrowParens": "always",
        "endOfLine": "auto"
      }
    ],
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
};
