const path = require('path');

module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard-with-typescript',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: [path.join(__dirname, 'tsconfig.json')]
  },
  plugins: ['react', 'prettier', 'header'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    eqeqeq: ['error', 'always']
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  overrides: [
    {
      files: ['src/**/*.ts', 'src/**/*.tsx', 'stories/**/*.ts', 'stories/**/*.tsx'],
      rules: {
        'header/header': [
          'error',
          'block',
          [
            {
              pattern: `(Copyright 20\\d{2}|istanbul ignore)`,
              template: `!\n * Copyright ${new Date().getFullYear()} Cognite AS\n `
            }
          ]
        ]
      }
    }
  ]
};
