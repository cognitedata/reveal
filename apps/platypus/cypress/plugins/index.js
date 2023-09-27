module.exports = (on, config) => {
  // add this line to execute code coverage
  require('@cypress/code-coverage/task')(on, config);
  return config;
};
