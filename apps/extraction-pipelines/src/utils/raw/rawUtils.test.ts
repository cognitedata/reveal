import { getDatabaseTables } from './rawUtils';
import { databaseListMock } from '../mockResponse';

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
});
