const nodeResolve = require('@rollup/plugin-node-resolve');
const defaultRollup = require('@nrwl/react/plugins/bundle-rollup');

module.exports = (config, context) => {
  function isExternal(moduleName) {
    const internal =
      moduleName.includes('@platypus') || /^\.{0,2}\//.test(moduleName);
    return !internal;
  }

  config = defaultRollup(config, context);
  config.external = isExternal;
  config.plugins = [
    nodeResolve({
      moduleDirectories: ['node_modules', 'dist'],
      modulePaths: ['dist/libs'],
    }),
    ...config.plugins,
  ];
  return config;
};
