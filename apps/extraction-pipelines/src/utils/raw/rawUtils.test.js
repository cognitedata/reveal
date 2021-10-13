import {
  getDatabaseTables,
  mapStoredToDefault,
  RawTableOptions,
} from 'utils/raw/rawUtils';
import { databaseListMock } from 'utils/mockResponse';

describe('rawUtils', () => {
  describe('getDatabaseTables', () => {
    test('Gets tables based on selcedted db', () => {
      const databaseList = databaseListMock;
      const tableSearch = '';
      const selectedDb = databaseList[0].database.name;
      const res = getDatabaseTables({ databaseList, selectedDb, tableSearch });
      expect(res.length).toEqual(2);
      expect(res[0].name).toEqual(databaseList[0].tables[0].name);
    });

    test('Gets tables based on selcedted db and search', () => {
      const databaseList = databaseListMock;
      const tableSearch = 'foo';
      const selectedDb = databaseList[0].database.name;
      const res = getDatabaseTables({ databaseList, selectedDb, tableSearch });
      expect(res.length).toEqual(1);
      expect(res[0].name).toEqual(databaseList[0].tables[1].name);
    });
    test('Gets tables', () => {
      const databaseList = databaseListMock;
      const tableSearch = '';
      const selectedDb = '';
      const res = getDatabaseTables({ databaseList, selectedDb, tableSearch });
      expect(res.length).toEqual(0);
    });
  });
  const cases = [
    {
      desc: 'Undefined, raw not set',
      rawTables: undefined,
      expected: {
        rawTable: '',
        selectedRawTables: [],
      },
    },
    {
      desc: 'Empty, no raw table',
      rawTables: [],
      expected: {
        rawTable: RawTableOptions.NO,
        selectedRawTables: [],
      },
    },
    {
      desc: 'Rawtables exist, raw table yes',
      rawTables: [{ dbName: 'db', tableName: 'table' }],
      expected: {
        rawTable: RawTableOptions.YES,
        selectedRawTables: [{ dbName: 'db', tableName: 'table' }],
      },
    },
  ];

  cases.forEach(({ desc, expected, rawTables }) => {
    test(`${desc}`, () => {
      const res = mapStoredToDefault(rawTables);
      expect(res.rawTable).toEqual(expected.rawTable);
      expect(res.selectedRawTables).toEqual(expected.selectedRawTables);
    });
  });
});
