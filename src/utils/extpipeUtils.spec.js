import {
  fetchExtpipesByDataSetId,
  mapDataSetExtpipe,
} from 'utils/extpipeUtils';
import sdk from '@cognite/cdf-sdk-singleton';

jest.mock('@cognite/cdf-sdk-singleton', () => {
  return {
    sdk: jest.fn(),
  };
});
sdk.get = jest.fn();

describe('ExtpipeUtils', () => {
  describe('mapDataSetExtpipe', () => {
    test('should match extpipes with the corresponding data set', () => {
      const dataSets = [{ id: 123 }, { id: 321 }, { id: 111 }];
      const extpipes = [
        { dataSetId: 111, name: 'extpipe 1' },
        { dataSetId: 999, name: 'extpipe 2' },
        { dataSetId: 123, name: 'extpipe 3' },
      ];
      const res = mapDataSetExtpipe(dataSets, extpipes);
      expect(res[0].extpipes[0].name).toEqual(extpipes[2].name);
      expect(res[1].extpipes.length).toEqual(0);
      expect(res[2].extpipes[0]).toEqual(extpipes[0]);
    });
  });

  describe('fetchExtpipesByDataSetId', () => {
    test('Fetched extpipes and filter by dataSetId', async () => {
      const extpipe = {
        name: 'my extpipe',
        dataSetId: 123,
      };
      const extpipe2 = {
        name: 'other extpipe',
        dataSetId: 321,
      };
      const extpipe3 = {
        name: 'foo',
        dataSetId: 321,
      };
      const extpipes = [extpipe, extpipe2, extpipe3];
      sdk.get.mockResolvedValue({ data: { items: extpipes } });
      const res = await fetchExtpipesByDataSetId(321);
      expect(sdk.get).toHaveBeenCalledTimes(1);
      expect(res.length).toEqual(2);
      expect(res[0]).toEqual(extpipe2);
    });
  });
});
