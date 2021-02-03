import { DataSet } from '@cognite/sdk';
import {
  getDataSetsLink,
  mapDataSetResponse,
  mapDataSetToIntegration,
  mapUniqueDataSetIds,
  parseDataSetMeta,
} from './dataSetUtils';
import { mockDataSetResponse, getMockResponse } from './mockResponse';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from './baseURL';

describe('Data set util', () => {
  const metaDataMock = {
    consoleCreatedBy: '{"username":"lisa.halvorsen@cognitedata.com"}',
    consoleMetaDataVersion: '3',
    consoleLabels: '["Test","Lisa","Itera"]',
    consoleOwners:
      '[{"name":"Lisa Halvorsen","email":"lisa.halvorsen@cognite.com"}]',
    consoleAdditionalDocs: '[]',
    consoleSource: '{"names":["ThisGoesInSources"]}',
    consoleExtractors: '{"accounts":["4714858637600598"]}',
    rawTables: '[{"databaseName":"informatica","tableName":"oracle"}]',
    transformations:
      '[{"name":"External Transformation","type":"external","details":"ExternalTransformationInformation"}]',
    consoleGoverned: 'false',
  };

  test('mapUniqueDataSetIds - Retuns uniq ids', () => {
    const res = mapUniqueDataSetIds(getMockResponse());
    expect(res.length).toEqual(3);
  });

  test('mapDataSetToIntegration -', () => {
    const mockRes = getMockResponse();
    const res = mapDataSetToIntegration(mockRes);
    expect(res.length).toEqual(mockRes.length);
  });

  test('parseDataSetMeta - empty object should return empty obj', () => {
    const res = parseDataSetMeta({});
    expect(res).toEqual({});
  });
  test('parseDataSetMeta - parse all values without failing', () => {
    const metadata = {
      otherNumber: 123123,
      is: true,
      thisString: 'other string',
      consoleCreatedBy: '{"username":"lisa.halvorsen@cognitedata.com"}',
    };
    const res = parseDataSetMeta(metadata);
    expect(res.consoleCreatedBy).toEqual({
      username: 'lisa.halvorsen@cognitedata.com',
    });
  });

  test('parseDataSetMeta - should parse json string values', () => {
    const res = parseDataSetMeta(metaDataMock);
    expect(res.consoleCreatedBy).toEqual({
      username: 'lisa.halvorsen@cognitedata.com',
    });
    expect(res.consoleMetaDataVersion).toEqual(3);
    expect(res.consoleLabels).toEqual(['Test', 'Lisa', 'Itera']);
    expect(res.consoleOwners).toEqual([
      { name: 'Lisa Halvorsen', email: 'lisa.halvorsen@cognite.com' },
    ]);
    expect(res.consoleAdditionalDocs).toEqual([]);
    expect(res.consoleSource).toEqual({ names: ['ThisGoesInSources'] });
    expect(res.consoleExtractors).toEqual({ accounts: ['4714858637600598'] });
    expect(res.rawTables).toEqual([
      { databaseName: 'informatica', tableName: 'oracle' },
    ]);
    expect(res.transformations).toEqual([
      {
        name: 'External Transformation',
        type: 'external',
        details: 'ExternalTransformationInformation',
      },
    ]);
    expect(res.consoleGoverned).toEqual(false);
  });
  test('mapDataSetResponse - handle empty array', () => {
    const res = mapDataSetResponse([]);
    expect(res).toEqual([]);
  });

  test('mapDataSetResponse - maps response correctly', () => {
    const mockRes = [
      {
        id: 123123123,
        externalId: 'test_external_id_1',
        createdTime: 1605349723208,
        description: 'this is the description',
        name: 'this is the name',
        metadata: metaDataMock,
      },
    ];
    const res = mapDataSetResponse(mockRes);
    expect(res.length).toEqual(mockRes.length);
    expect(res[0].name).toEqual(mockRes[0].name);
    expect(res[0].description).toEqual(mockRes[0].description);
    expect(res[0].metadata).toBeDefined();
    expect(res[0].metadata.consoleOwners).toBeDefined();
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

  const dataSetId = '123123123';
  const getDataSetCases = [
    {
      desc: 'Creat link with env when cdfEnv is defined',
      value: {
        origin: ORIGIN_DEV,
        project: PROJECT_ITERA_INT_GREEN,
        dataSetId,
        cdfEnv: CDF_ENV_GREENFIELD,
      },
      expected:
        'dev/itera-int-green/data-sets/data-set/123123123?env=greenfield',
    },
    {
      desc: 'Creat link with out env when cdfEnv is not defined',
      value: {
        origin: ORIGIN_DEV,
        project: PROJECT_ITERA_INT_GREEN,
        dataSetId,
      },
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
