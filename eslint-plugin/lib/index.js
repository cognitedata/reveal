/* eslint-disable global-require */
const allRules = {
  'forbid-styled-macro': require('./rules/forbid-styled-macro'),
  'no-number-z-index-inline-styling': require('./rules/no-number-z-index-inline-styling'),
  'no-number-z-index-property': require('./rules/no-number-z-index-property'),
  'no-number-z-index-styled-components': require('./rules/no-number-z-index-styled-components'),
  'no-sdk-submodule-imports': require('./rules/no-sdk-submodule-imports'),
  'no-unissued-todos': require('./rules/no-unissued-todos'),
  'require-hellip': require('./rules/require-hellip'),
  'require-styled-macro': require('./rules/require-styled-macro'),
  'require-t-function': require('./rules/require-t-function'),
  'rtl-use-custom-render-function': require('./rules/rtl-use-custom-render-function'),
};

module.exports = {
  rules: allRules,
  configs: {
    opsup: {
      plugins: ['@cognite'],
      rules: {
        '@cognite/no-number-z-index-inline-styling': 2,
        '@cognite/no-number-z-index-property': 2,
        '@cognite/no-number-z-index-styled-components': 2,
        '@cognite/no-sdk-submodule-imports': 2,
        '@cognite/require-styled-macro': 1,
        '@cognite/require-t-function': 1,
      },
    },
    insight: {
      plugins: ['@cognite'],
      rules: {
        '@cognite/no-unissued-todos': 1,
      },
    },
    noNumZIndex: {
      plugins: ['@cognite'],
      rules: {
        '@cognite/no-number-z-index-inline-styling': 2,
        '@cognite/no-number-z-index-property': 2,
        '@cognite/no-number-z-index-styled-components': 2,
      },
    },
    sdk: {
      plugins: ['@cognite'],
      rules: {
        '@cognite/no-sdk-submodule-imports': 2,
      },
    },
    all: {
      plugins: ['@cognite'],
      rules: {
        'no-number-z-index-inline-styling': 2,
        'no-number-z-index-property': 2,
        'no-number-z-index-styled-components': 2,
        'no-sdk-submodule-imports': 2,
        'no-unissued-todos': 2,
        'require-hellip': 1,
        'require-styled-macro': 2,
        'require-t-function': 2,
        'rtl-use-custom-render-function': 2,
      },
    },
  },
};
