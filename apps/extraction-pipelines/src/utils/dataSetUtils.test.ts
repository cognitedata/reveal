import { DataSet } from '@cognite/sdk';
import { mapDataSetToIntegration, mapUniqueDataSetIds } from './dataSetUtils';
import { mockDataSetResponse, getMockResponse } from './mockResponse';

describe('Data set util', () => {
  test('mapUniqueDataSetIds - Retuns uniq ids', () => {
    const res = mapUniqueDataSetIds(getMockResponse());
    expect(res.length).toEqual(3);
  });

  test('mapDataSetToIntegration - maps dataset to integration', () => {
    const dataSetsResponse: DataSet[] = mockDataSetResponse();
    const result = mapDataSetToIntegration(getMockResponse(), dataSetsResponse);
    expect(result.length).toEqual(getMockResponse().length);
    result.forEach((res) => {
      expect(res.dataSet).toBeDefined();
      expect(res.dataSet?.id).toEqual(parseInt(res.dataSetId, 10));
      expect(res.dataSet?.name).toBeDefined();
    });
  });

  test('mapDataSetToIntegration - should not fail when dataset response is empty', () => {
    const dataSetsResponse: DataSet[] = [];
    const result = mapDataSetToIntegration(getMockResponse(), dataSetsResponse);
    expect(result.length).toEqual(getMockResponse().length);
    result.forEach((res) => {
      expect(res.dataSet).toBeUndefined();
    });
  });
});
