import {
  getDataSetsLink,
  mapDataSetResponse,
  mapDataSetToExtpipe,
  mapUniqueDataSetIds,
  parseDataSetMeta,
} from './dataSetUtils';
import { getMockResponse, mockDataSetResponse } from './mockResponse';

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

  test('mapUniqueDataSetIds - Returns uniq ids', () => {
    const res = mapUniqueDataSetIds([
      ...getMockResponse(),
      { id: 12, name: 'no dataset' },
    ]);
    expect(res.length).toEqual(3);
  });

  test('mapDataSetToExtpipe -', () => {
    const mockRes = getMockResponse();
    const res = mapDataSetToExtpipe(mockRes);
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

  test('mapDataSetToExtpipe - maps dataset to extpipe', () => {
    const dataSetsResponse = mockDataSetResponse();
    const result = mapDataSetToExtpipe(getMockResponse(), dataSetsResponse);
    expect(result.length).toEqual(getMockResponse().length);
    result.forEach((res) => {
      expect(res.dataSet).toBeDefined();
      expect(res.dataSet?.id).toEqual(parseInt(res.dataSetId, 10));
      expect(res.dataSet?.name).toBeDefined();
    });
  });

  test('mapDataSetToExtpipe - should not fail when dataset response is empty', () => {
    const dataSetsResponse = [];
    const result = mapDataSetToExtpipe(getMockResponse(), dataSetsResponse);
    expect(result.length).toEqual(getMockResponse().length);
    result.forEach((res) => {
      expect(res.dataSet).toBeUndefined();
    });
  });

  const dataSetId = '123123123';
  const getDataSetCases = [
    {
      desc: 'Creat link with env when cdfEnv is defined',
      expected: '//data-sets/data-set/123123123',
    },
    {
      desc: 'Creat link with out env when cdfEnv is not defined',
      expected: '//data-sets/data-set/123123123',
    },
  ];
  getDataSetCases.forEach(({ desc, expected }) => {
    test(`${desc}`, () => {
      const res = getDataSetsLink(dataSetId);
      expect(res).toEqual(expected);
    });
  });
});
