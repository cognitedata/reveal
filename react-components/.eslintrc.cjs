module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'love',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  plugins: ['react', 'prettier', 'header'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/class-literal-property-style': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    'no-console': [2, { allow: ['warn', 'error'] }],
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
    },
    {
      files: ['src/**/*.spec.ts', 'src/**/*.spec.tsx', 'src/**/*.test.ts', 'src/**/*.test.tsx', 'tests/tests-utilities/**/*.ts'],
      rules: {
        "@typescript-eslint/unbound-method": 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
      }
    }
  ]
};
