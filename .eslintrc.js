module.exports = {
  extends: './.eslintrc.production.js',
  // We can relax some settings here for nicer development experience; warnings will crash in CI
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: ['accumulator', 'state'],
      },
    ],
    'react-hooks/exhaustive-deps': ['warn'],
  },
};
