import { UseTableRowProps } from 'react-table';

import { sortByAlphanumeric } from '../sortByAlphanumeric';

const tableRowProps = {
  allCells: [],
  cells: [],
  getRowProps: jest.fn(),
  index: 1,
  original: {},
  subRows: [],
};

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
    expect(sortByAlphanumeric(rowA, rowB, 'operator')).toEqual(1);
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
    expect(sortByAlphanumeric(rowA, rowB, 'operator')).toEqual(1);
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
    expect(sortByAlphanumeric(rowA, rowB, 'operator')).toEqual(1);
  });
});
