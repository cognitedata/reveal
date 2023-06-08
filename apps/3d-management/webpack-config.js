const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');
const {
  withSingleSpa,
} = require('../../tools/webpack/single-spa-webpack-config');

module.exports = composePlugins(
  withNx(),
  withReact(),
  withSingleSpa({ useMockEnv: false }),
  (config) => {
    config.module.rules = [
      ...config.module.rules.filter((rule) => !Array.isArray(rule.oneOf)),
      {
        oneOf: [
          ...config.module.rules
            .find((rule) => Array.isArray(rule.oneOf))
            .oneOf.map((rule) => {
              // This part is added as a workaround for a webpack 5 problem that
              // occurs while using @cognite/reveal@3.2.0. For more details, you
              // can check:
              // https://github.com/cognitedata/reveal-cra-three-import-bug
              if (rule.type === 'asset/resource') {
                return {
                  ...rule,
                  exclude: [...rule.exclude, /node_modules\/three/],
                };
              }
              return rule;
            }),
        ],
      },
    ];
  }
);
