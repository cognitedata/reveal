import {
  curatedColumns,
  defaultConfigurations,
  generatedColumns,
  getColumnRules,
} from '__fixtures__/fixtureConfigurations';

import config from '../../configs/configurations.config';
import { curateColumns, curateConfigurationsData } from '../curate';

describe('Configurations/Curate', () => {
  describe('curateConfigurationsData', () => {
    it('Curates the the result from configuration endpoint correctly', () => {
      const result = curateConfigurationsData(defaultConfigurations);
      const [item] = defaultConfigurations;

      expect(result).toEqual([
        {
          ...item,
          statusColor: item.status_active,
          repoProject: `${item.source.external_id} / ${item.target.external_id}`,
          actions: {
            direction: 'psToOw',
            statusActive: item.status_active,
            id: item.id,
            name: item.name,
          },
          conf_name: {
            name: item.name,
            id: item.id,
          },
        },
      ]);
    });
  });

  it('returns the empty list if configurations are empty', () => {
    const result = curateConfigurationsData([]);
    expect(result).toEqual([]);
  });

  describe('curateColumns', () => {
    it('Returns empty list if undefined', () => {
      const result = curateColumns(undefined, getColumnRules);
      expect(result).toEqual([]);
    });

    it('Generates the correct columns, as well as, sets the disabled sorting disabled flag', () => {
      const result = curateColumns(generatedColumns, getColumnRules);

      expect(result).toMatchObject(curatedColumns);
      expect(result.length).toEqual(generatedColumns.length);
      config.nonSortableColumns.forEach((nonSortableItem) => {
        const item = result.find((item) => item.accessor === nonSortableItem);
        expect(item.disableSortBy).toBeTruthy();
      });
    });
  });
});
