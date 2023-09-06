const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const {
  withSingleSpa,
} = require('../../tools/webpack/single-spa-webpack-config');
const { filterEnvVars } = require('../../tools/webpack/filter-env-vars');

module.exports = composePlugins(
  withNx(),
  withReact(),
  filterEnvVars(),
  withSingleSpa({ useMockEnv: false }),
  (config) => {
    const nodeEnv = process.env.NODE_ENV || 'production';
    console.log(
      `Custom webpack config(${nodeEnv}) for 3d Management was loaded...`
    );

    config.resolve.fallback = { path: require.resolve('path-browserify') };

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

    if (nodeEnv === 'development' && config.devServer) {
      // Temp fix to devserver and hmr
      config.devServer.allowedHosts = 'all';
      config.devServer.headers['Access-Control-Allow-Origin'] = '*';
      config.devServer.https = true;
      config.devServer.port = 3033;

      config.devServer.static = {
        watch: {
          followSymlinks: true,
        },
      };
    }

    return config;
  }
);
