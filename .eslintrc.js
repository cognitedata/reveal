module.exports = {
  extends: ['@cognite', 'react-app'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'no-param-reassign': ['error', { props: false }],
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars-experimental': [
      'error',
      { ignoredNamesRegex: '^_' },
    ],
  },
  overrides: [
    {
      files: ['**/*.stories.tsx'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
