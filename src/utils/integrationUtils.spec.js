import {
  fetchIntegrationsByDataSetId,
  mapDataSetIntegration,
} from 'utils/integrationUtils';
import sdk from '@cognite/cdf-sdk-singleton';

jest.mock('@cognite/cdf-sdk-singleton', () => {
  return {
    sdk: jest.fn(),
  };
});
sdk.get = jest.fn();

describe('IntegrationUtils', () => {
  describe('mapDataSetIntegration', () => {
    test('should match integrations with the corresponding data set', () => {
      const dataSets = [{ id: 123 }, { id: 321 }, { id: 111 }];
      const integrations = [
        { dataSetId: 111, name: 'integration 1' },
        { dataSetId: 999, name: 'integration 2' },
        { dataSetId: 123, name: 'integration 3' },
      ];
      const res = mapDataSetIntegration(dataSets, integrations);
      expect(res[0].integrations[0].name).toEqual(integrations[2].name);
      expect(res[1].integrations.length).toEqual(0);
      expect(res[2].integrations[0]).toEqual(integrations[0]);
    });
  });

  describe('fetchIntegrationsByDataSetId', () => {
    test('Fetched integrations and filter by dataSetId', async () => {
      const integration = {
        name: 'my integration',
        dataSetId: 123,
      };
      const integration2 = {
        name: 'other integration',
        dataSetId: 321,
      };
      const integration3 = {
        name: 'foo',
        dataSetId: 321,
      };
      const integrations = [integration, integration2, integration3];
      sdk.get.mockResolvedValue({ data: { items: integrations } });
      const res = await fetchIntegrationsByDataSetId(321);
      expect(sdk.get).toHaveBeenCalledTimes(1);
      expect(res.length).toEqual(2);
      expect(res[0]).toEqual(integration2);
    });
  });
});
