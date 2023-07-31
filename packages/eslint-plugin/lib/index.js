/* eslint-disable global-require */
const allRules = {
  'no-number-z-index': require('./rules/no-number-z-index'),
  'no-sdk-submodule-imports': require('./rules/no-sdk-submodule-imports'),
  'no-unissued-todos': require('./rules/no-unissued-todos'),
  'require-hellip': require('./rules/require-hellip'),
  'require-t-function': require('./rules/require-t-function'),
  'rtl-use-custom-render-function': require('./rules/rtl-use-custom-render-function'),
  'styled-macro': require('./rules/styled-macro'),
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
        '@cognite/styled-macro': 1,
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
  processors: {
    '.html': {
      preprocess(text) {
        // If we would need an advanced parsing we can use JSDOM implementation later
        const hasDocumentReferrerTag = text.indexOf('referrer') > -1;

        if (!hasDocumentReferrerTag) {
          throw new Error(
            `Referrer policy should be specified in html-files
https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy

<meta name="referrer" content="origin">

We want to restrict Cognite applications from sending sensitive data such as access tokens in referer headers which may possibly be stored in logs in CDF or be sent to third- party services
            `
          );
        }

        return [];
      },
    },
  },
};
