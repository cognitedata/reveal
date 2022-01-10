import { UseTableRowProps } from 'react-table';

import {
  alphanumeric,
  caseInsensitiveSort,
  sortObjectsAscending,
  sortObjectsDecending,
} from 'utils/sort';

const tableRowProps = {
  allCells: [],
  cells: [],
  getRowProps: jest.fn(),
  index: 1,
  original: {},
  subRows: [],
};

type MockSortType = { row: { value: number | string } };
describe('Table custom sort types', () => {
  test('Should sort by string', () => {
    const rowA: UseTableRowProps<Record<string, unknown>> = {
      values: {
        operator: 'BP',
      },
      id: 'rowA',
      ...tableRowProps,
    };
    const rowB = {
      values: {
        operator: 'Anadarko',
      },
      id: 'rowB',
      ...tableRowProps,
    };
    expect(alphanumeric(rowA, rowB, 'operator')).toEqual(1);
  });

  test('Should sort by number', () => {
    const rowA = {
      values: {
        operator: '2',
      },
      id: 'rowA',
      ...tableRowProps,
    };
    const rowB = {
      values: {
        operator: '1',
      },
      id: 'rowB',
      ...tableRowProps,
    };
    expect(alphanumeric(rowA, rowB, 'operator')).toEqual(1);
  });

  test('Should support case insensitive sort', () => {
    const rowA = {
      values: {
        operator: 'bp',
      },
      id: 'rowA',
      ...tableRowProps,
    };
    const rowB = {
      values: {
        operator: 'Anadarko',
      },
      id: 'rowB',
      ...tableRowProps,
    };
    expect(alphanumeric(rowA, rowB, 'operator')).toEqual(1);
  });
});

describe('Case insensitive sort', () => {
  test('Should sort by string', () => {
    expect(caseInsensitiveSort('BP', 'Anadarko')).toEqual(1);
  });

  test('Should sort by number', () => {
    expect(caseInsensitiveSort('2', '1')).toEqual(1);
  });

  test('Should support case insensitive sort', () => {
    expect(caseInsensitiveSort('bp', 'Anadarko')).toEqual(1);
  });

  test('Should sort by number (reversed)', () => {
    expect(caseInsensitiveSort('1', '2', true)).toEqual(1);
  });

  test('Should support case insensitive sort (reversed)', () => {
    expect(caseInsensitiveSort('anadarko', 'BP', true)).toEqual(1);
  });
});

describe('Sort objects by key', () => {
  type Data = { key: string; label: string; value: number };

  const data: Data[] = [
    { key: 'key2', label: 'label2', value: 2 },
    { key: 'key1', label: 'label1', value: 1 },
    { key: 'key4', label: 'label4', value: 4 },
    { key: 'key3', label: 'label3', value: 3 },
  ];

  it('Should sort objects ascending', () => {
    expect(sortObjectsAscending<Data>(data, 'key')).toEqual([
      { key: 'key1', label: 'label1', value: 1 },
      { key: 'key2', label: 'label2', value: 2 },
      { key: 'key3', label: 'label3', value: 3 },
      { key: 'key4', label: 'label4', value: 4 },
    ]);

    expect(sortObjectsAscending<Data>(data, 'label')).toEqual([
      { key: 'key1', label: 'label1', value: 1 },
      { key: 'key2', label: 'label2', value: 2 },
      { key: 'key3', label: 'label3', value: 3 },
      { key: 'key4', label: 'label4', value: 4 },
    ]);

    expect(sortObjectsAscending<Data>(data, 'value')).toEqual([
      { key: 'key1', label: 'label1', value: 1 },
      { key: 'key2', label: 'label2', value: 2 },
      { key: 'key3', label: 'label3', value: 3 },
      { key: 'key4', label: 'label4', value: 4 },
    ]);
  });

  it('Should sort objects descending', () => {
    expect(sortObjectsDecending<Data>(data, 'key')).toEqual([
      { key: 'key4', label: 'label4', value: 4 },
      { key: 'key3', label: 'label3', value: 3 },
      { key: 'key2', label: 'label2', value: 2 },
      { key: 'key1', label: 'label1', value: 1 },
    ]);

    expect(sortObjectsDecending<Data>(data, 'label')).toEqual([
      { key: 'key4', label: 'label4', value: 4 },
      { key: 'key3', label: 'label3', value: 3 },
      { key: 'key2', label: 'label2', value: 2 },
      { key: 'key1', label: 'label1', value: 1 },
    ]);

    expect(sortObjectsDecending<Data>(data, 'value')).toEqual([
      { key: 'key4', label: 'label4', value: 4 },
      { key: 'key3', label: 'label3', value: 3 },
      { key: 'key2', label: 'label2', value: 2 },
      { key: 'key1', label: 'label1', value: 1 },
    ]);
  });
});

describe('Ase/Desc sort', () => {
  test('Should sort by numbers', () => {
    const list: MockSortType[] = [
      {
        row: {
          value: 15,
        },
      },
      {
        row: {
          value: -10,
        },
      },
      {
        row: {
          value: 25,
        },
      },
    ];

    const ascendingResult = sortObjectsAscending(
      list,
      'row.value' as keyof MockSortType
    );
    expect(ascendingResult[0].row.value).toEqual(-10);
    expect(ascendingResult[1].row.value).toEqual(15);
    expect(ascendingResult[2].row.value).toEqual(25);

    const decendingResult = sortObjectsDecending(
      list,
      'row.value' as keyof MockSortType
    );
    expect(decendingResult[0].row.value).toEqual(25);
    expect(decendingResult[1].row.value).toEqual(15);
    expect(decendingResult[2].row.value).toEqual(-10);
  });

  test('Should sort by string', () => {
    const list: MockSortType[] = [
      {
        row: {
          value: 'test',
        },
      },
      {
        row: {
          value: '-',
        },
      },
      {
        row: {
          value: 'sort',
        },
      },
    ];

    const ascendingResult = sortObjectsAscending(
      list,
      'row.value' as keyof MockSortType
    );
    expect(ascendingResult[0].row.value).toEqual('-');
    expect(ascendingResult[1].row.value).toEqual('sort');
    expect(ascendingResult[2].row.value).toEqual('test');

    const decendingResult = sortObjectsDecending(
      list,
      'row.value' as keyof MockSortType
    );
    expect(decendingResult[0].row.value).toEqual('test');
    expect(decendingResult[1].row.value).toEqual('sort');
    expect(decendingResult[2].row.value).toEqual('-');
  });
});
