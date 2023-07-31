const baseConfig = require('./base');

module.exports = {
  ...baseConfig,
  extends: [
    'airbnb',
    ...baseConfig.extends,
    'plugin:react/recommended',
    'plugin:testing-library/react',
  ],
  plugins: [...baseConfig.plugins, 'testing-library', 'react', 'react-hooks'],
  rules: {
    ...baseConfig.rules,
    '@cognite/no-unissued-todos': 'error',

    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'],
      },
    ],

    'react/function-component-definition': ['off'],
    'react/jsx-no-useless-fragment': [
      'error',
      {
        // Allows for '<>{children}</>' cases
        allowExpressions: true,
      },
    ],

    'react/jsx-no-bind': ['off'],
    'react/destructuring-assignment': 0,
    'react/jsx-filename-extension': [0],
    // Disable this because it does not yet handle custom proptypes.
    // See: https://github.com/yannickcr/eslint-plugin-react/issues/1389
    'react/no-typos': ['off'],

    'react/jsx-props-no-spreading': ['off'],
    'react/static-property-placement': ['off'],
    'react/state-in-constructor': ['off'],
    'react/react-in-jsx-scope': ['off'],
    'react/jsx-uses-react': ['off'],
    'react/display-name': ['off'],

    'react-hooks/exhaustive-deps': ['off'],
  },
  overrides: [
    ...baseConfig.overrides,
    {
      files: ['*.ts?(x)'],
      rules: {
        'react/prop-types': ['off'],
        'react/require-default-props': ['off'],
      },
    },
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': ['off'],
      },
    },
  ],
};
