/* eslint-disable global-require */
const allRules = {
  'forbid-styled-macro': require('./rules/forbid-styled-macro'),
  'no-number-z-index': require('./rules/no-number-z-index'),
  'no-sdk-submodule-imports': require('./rules/no-sdk-submodule-imports'),
  'no-unissued-todos': require('./rules/no-unissued-todos'),
  'require-hellip': require('./rules/require-hellip'),
  'require-styled-macro': require('./rules/require-styled-macro'),
  'require-t-function': require('./rules/require-t-function'),
  'rtl-use-custom-render-function': require('./rules/rtl-use-custom-render-function'),
};

const pluginsAllRules = Object.keys(allRules).reduce((acc, name) => {
  if (name === 'forbid-styled-macro') {
    return acc;
  }
  return {
    ...acc,
    [`@cognite/${name}`]: 2,
  };
}, {});

module.exports = {
  rules: allRules,
  configs: {
    opsup: {
      plugins: ['@cognite'],
      rules: {
        '@cognite/no-number-z-index': 2,
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
        '@cognite/no-number-z-index': 2,
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
      rules: pluginsAllRules,
    },
  },
};
