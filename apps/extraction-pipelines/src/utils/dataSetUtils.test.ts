import { DataSet } from '@cognite/sdk';
import {
  getDataSetsLink,
  mapDataSetToIntegration,
  mapUniqueDataSetIds,
} from './dataSetUtils';
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

  const origin = 'dev';
  const project = 'itera-int-green';
  const dataSetId = '123123123';
  const getDataSetCases = [
    {
      desc: 'Creat link with env when cdfEnv is defined',
      value: { origin, project, dataSetId, cdfEnv: 'greenfield' },
      expected:
        'dev/itera-int-green/data-sets/data-set/123123123?env=greenfield',
    },
    {
      desc: 'Creat link with out env when cdfEnv is not defined',
      value: { origin, project, dataSetId },
      expected: 'dev/itera-int-green/data-sets/data-set/123123123',
    },
  ];
  getDataSetCases.forEach(({ desc, value, expected }) => {
    test(`${desc}`, () => {
      const res = getDataSetsLink(value);
      expect(res).toEqual(expected);
    });
  });
});
