import { RawDBRow } from '@cognite/sdk';
import { describe, expect, test } from '@jest/globals';

import { prepareRows } from './DownloadTableModal';

const mockRows: RawDBRow[] = [
  {
    lastUpdatedTime: new Date('03-01-2020'),
    key: 'row-1',
    columns: {
      foo: 'foo value',
      bar: 'bar value',
    },
  },
  {
    lastUpdatedTime: new Date('02-01-2020'),
    key: 'row-2',
    columns: {
      bar: 'bar value',
      baz: 'baz value',
    },
  },
  {
    lastUpdatedTime: new Date('01-01-2020'),
    key: 'row-to-override-key-column',
    columns: {
      baz: 'baz value',
      key: 'value to be overridden',
    },
  },
];

describe('prepare fetched rows before downloading', () => {
  test('slices rows array if there are more items than expected count', () => {
    expect(prepareRows(mockRows, mockRows.length - 1)).toHaveLength(
      mockRows.length - 1
    );
  });

  test('returns all fetched rows if there are less items than expected count', () => {
    expect(prepareRows(mockRows, mockRows.length + 1)).toHaveLength(
      mockRows.length
    );
  });

  test('includes all columns', () => {
    const preparedRows = prepareRows(mockRows, mockRows.length);

    preparedRows.forEach((row, index) => {
      const columnNames = Object.keys(mockRows[index].columns);
      expect(columnNames.every((name) => name in row)).toBeTruthy();
    });
  });

  test('returns the correct number of columns', () => {
    const preparedRows = prepareRows(mockRows, mockRows.length);

    preparedRows.forEach((row, index) => {
      const columnNames = Object.keys(mockRows[index].columns);
      if (columnNames.includes('key')) {
        expect(Object.keys(row).length).toBe(columnNames.length);
      } else {
        expect(Object.keys(row).length).toBe(columnNames.length + 1);
      }
    });
  });

  test('includes row key column', () => {
    const preparedRows = prepareRows(mockRows, mockRows.length);

    preparedRows.forEach((row) => {
      expect('key' in row).toBeTruthy();
    });
  });

  test('overrides row key column if it exists in original data', () => {
    const mockRowsToOverrideKeyColumn = mockRows.filter(
      ({ columns }) => 'key' in columns
    );
    const preparedRows = prepareRows(
      mockRowsToOverrideKeyColumn,
      mockRowsToOverrideKeyColumn.length
    );

    preparedRows.forEach((row, index) => {
      expect(row.key).toEqual(mockRowsToOverrideKeyColumn[index].key);
    });
  });
});
