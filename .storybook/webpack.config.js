const path = require('path');

const MOCKS_DIRECTORY = '__mocks__';
const MOCKS_DIRECTORY_PATH = path.resolve(
  __dirname,
  '..',
  'src',
  MOCKS_DIRECTORY
);
const MOCKED_MODULES = [];

module.exports = ({ config }) => {
  MOCKED_MODULES.forEach((moduleName) => {
    config.resolve.alias[moduleName] = path.join(
      MOCKS_DIRECTORY_PATH,
      moduleName
    );
  });

  return config;
};
