/* eslint-disable global-require */
const allRules = {
  'no-number-z-index-inline-styling': require('./rules/no-number-z-index-inline-styling'),
  'no-number-z-index-property': require('./rules/no-number-z-index-property'),
  'no-number-z-index-styled-components': require('./rules/no-number-z-index-styled-components'),
  'no-sdk-submodule-imports': require('./rules/no-sdk-submodule-imports'),
  'no-unissued-todos': require('./rules/no-unissued-todos'),
  'require-styled-macro': require('./rules/require-styled-macro'),
  'require-t-function': require('./rules/require-t-function'),
  'rtl-use-custom-render-function': require('./rules/rtl-use-custom-render-function'),
};

const pluginsAllRules = Object.keys(allRules).reduce(
  (o, rule) => Object.assign(o, { [`@cognite/${rule}`]: 'error' }),
  {}
);

module.exports = {
  rules: allRules,
  configs: {
    opsup: {
      plugins: ['@cognite'],
      rules: {
        '@cognite/no-number-z-index-inline-styling': 'error',
        '@cognite/no-number-z-index-property': 'error',
        '@cognite/no-number-z-index-styled-components': 'error',
        '@cognite/no-sdk-submodule-imports': 'error',
        '@cognite/require-styled-macro': 'warn',
        '@cognite/require-t-function': 'warn',
      },
    },
    insight: {
      plugins: ['@cognite'],
      rules: {
        '@cognite/no-unissued-todos': 'warn',
      },
    },
    noNumZIndex: {
      plugins: ['@cognite'],
      rules: {
        '@cognite/no-number-z-index-inline-styling': 'error',
        '@cognite/no-number-z-index-property': 'error',
        '@cognite/no-number-z-index-styled-components': 'error',
      },
    },
    sdk: {
      plugins: ['@cognite'],
      rules: {
        '@cognite/no-sdk-submodule-imports': 'error',
      },
    },
    all: {
      plugins: ['@cognite'],
      rules: pluginsAllRules,
    },
  },
};
