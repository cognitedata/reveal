module.exports = {
  extends: [
    'plugin:react/recommended',
    '../viewer/.eslintrc.common.js'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  plugins: ['react'],
  rules: {
    'react/react-in-jsx-scope': 'off'
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
