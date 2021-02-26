import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { dbResponse, table2Response, tableResponse } from './mockResponse';
import { getRawDBsAndTables } from './RawDataBaseAPI';

describe('RawDataBaseAPI', () => {
  test('getRawDBsAndTables', async () => {
    sdkv3.raw.listDatabases.mockResolvedValue(dbResponse);
    sdkv3.raw.listTables
      .mockResolvedValueOnce(tableResponse)
      .mockResolvedValueOnce(table2Response);
    const res = await getRawDBsAndTables();
    expect(res.length).toEqual(dbResponse.items.length);
    expect(res[0].database.name).toEqual(dbResponse.items[0].name);
    expect(res[0].tables.length).toEqual(tableResponse.items.length);
    expect(res[0].tables[0].name).toEqual(tableResponse.items[0].name);
    expect(res[0].tables[1].name).toEqual(tableResponse.items[1].name);
  });
});
