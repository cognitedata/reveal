import { mapStoredToDefault, RawTableOptions } from 'utils/raw/rawUtils';

describe('rawUtils', () => {
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
