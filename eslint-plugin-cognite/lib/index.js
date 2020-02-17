/* eslint-disable global-require */
const allRules = {
  'no-number-z-index-inline-styling': require('./rules/no-number-z-index-inline-styling'),
  'no-number-z-index-property': require('./rules/no-number-z-index-property'),
  'no-number-z-index-styled-components': require('./rules/no-number-z-index-styled-components'),
  'no-unissued-todos': require('./rules/no-unissued-todos'),
  'require-styled-macro': require('./rules/require-styled-macro'),
  'require-t-function': require('./rules/require-t-function'),
};

const pluginsAllRules = Object.keys(allRules).reduce(
  (o, rule) => Object.assign(o, { [`@cognite/${rule}`]: 2 }),
  {}
);

module.exports = {
  rules: allRules,
  configs: {
    noNumZIndex: {
      plugins: ['@cognite'],
      rules: {
        '@cognite/no-number-z-index-inline-styling': 2,
        '@cognite/no-number-z-index-property': 2,
        '@cognite/no-number-z-index-styled-components': 2,
      },
    },
    all: {
      plugins: ['@cognite'],
      rules: pluginsAllRules,
    },
  },
};
