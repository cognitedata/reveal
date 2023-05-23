const nrwlConfig = require('@nrwl/react/plugins/bundle-rollup');
const resolver = require('@rollup/plugin-node-resolve');

module.exports = (config) => {
  const nxConfig = nrwlConfig(config);
  return {
    ...nxConfig,
    globals: {
      ...nxConfig.globals,
    },
    plugins: [...nxConfig.plugins, resolver()],
    external: ['lodash'],
  };
};
