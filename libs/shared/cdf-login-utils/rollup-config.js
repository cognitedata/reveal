const nrwlConfig = require('@nx/react/plugins/bundle-rollup');
const resolver = require('@rollup/plugin-node-resolve');

module.exports = (config) => {
  const nxConfig = nrwlConfig(config);
  const output = nxConfig.output;

  if (output.format === 'esm') {
    output.preserveModules = true;
  }

  return {
    ...nxConfig,
    output: [output],
    plugins: [...nxConfig.plugins, resolver()],
  };
};
