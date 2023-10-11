const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../../tsconfig.base.json');
const baseJestPreset = require('../../jest.preset.js');

module.exports = {
  ...baseJestPreset,
  moduleNameMapper: pathsToModuleNameMapper({
    ...compilerOptions.paths,
    '@cognite/charts-lib': ['dist/libs/charts-lib/src'],
  }),
};
