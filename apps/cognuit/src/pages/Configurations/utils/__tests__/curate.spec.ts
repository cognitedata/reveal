import { defaultConfigurations } from '__fixtures__/fixtureConfigurations';

import { curateConfigurationsData } from '../curate';

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
});
