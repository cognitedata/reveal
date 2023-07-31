import {
  extendedConfigurations,
  generatedColumns,
} from '__fixtures__/fixtureConfigurations';

import { generateConfigurationsColumnsFromData } from '../generate';

describe('Configurations/Generate', () => {
  describe('generateConfigurationsColumnsFromData', () => {
    it('Returns undefined if response is empty', () => {
      const result = generateConfigurationsColumnsFromData([]);
      expect(result).toBeUndefined();
    });

    it('Generates columns from configuration data', () => {
      const result = generateConfigurationsColumnsFromData(
        extendedConfigurations
      );

      expect(result).toMatchObject(generatedColumns);
    });
  });
});
