module.exports = function override(config) {
  if (!config.plugins) {
    // eslint-disable-next-line no-param-reassign
    config.plugins = [];
  }

  return config;
};
