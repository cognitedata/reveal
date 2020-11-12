import { DataSet } from '@cognite/sdk';
import { mapDataSetToIntegration, mapUniqueDataSetIds } from './dataSetUtils';
import { mockDataSetResponse, mockResponse } from './mockResponse';

describe('Data set util', () => {
  test('mapUniqueDataSetIds - Retuns uniq ids', () => {
    const res = mapUniqueDataSetIds(mockResponse);
    expect(res.length).toEqual(3);
  });

  test('mapDataSetToIntegration - maps dataset to integration', () => {
    const dataSetsResponse: DataSet[] = mockDataSetResponse();
    const result = mapDataSetToIntegration(mockResponse, dataSetsResponse);
    expect(result.length).toEqual(mockResponse.length);
    result.forEach((res) => {
      expect(res.dataSet).toBeDefined();
      expect(res.dataSet?.id).toEqual(parseInt(res.dataSetId, 10));
      expect(res.dataSet?.name).toBeDefined();
    });
  });

  test('mapDataSetToIntegration - should not fail when dataset response is empty', () => {
    const dataSetsResponse: DataSet[] = [];
    const result = mapDataSetToIntegration(mockResponse, dataSetsResponse);
    expect(result.length).toEqual(mockResponse.length);
    result.forEach((res) => {
      expect(res.dataSet).toBeUndefined();
    });
  });
});
