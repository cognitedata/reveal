import { Cell, HeaderGroup } from 'react-table';

import layers from 'utils/zindex';

import { ColumnType } from '..';
import {
  getStickyColumnHeadersStyles,
  getStickyColumnCellsStyles,
} from '../stickyColumnHandler';

const columns: ColumnType<any>[] = [
  {
    id: 'id1',
    Header: 'Column 1',
    accessor: 'accessor1',
    width: '100px',
    stickyColumn: true,
  },
  { id: 'id2', Header: 'Column 2', accessor: 'accessor2', width: '100px' },
  { id: 'id3', Header: 'Column 3', accessor: 'accessor3', width: '100px' },
];

const commonHeaderGroupProps = {
  maxWidth: 100,
  isVisible: true,
  totalLeft: 0,
  totalWidth: 100,
  render: jest.fn(),
  getHeaderProps: jest.fn(),
  getFooterProps: jest.fn(),
  getHeaderGroupProps: jest.fn(),
  getFooterGroupProps: jest.fn(),
  toggleHidden: jest.fn(),
  getToggleHiddenProps: jest.fn(),
  headers: [],
  totalHeaderCount: columns.length,
  depth: 0,
};

const commonCellProps = {
  row: jest.fn() as any,
  value: '',
  getCellProps: jest.fn(),
  render: jest.fn(),
};

describe('stickyColumnHandler', () => {
  describe('getStickyColumnHeadersStyles', () => {
    const headersWithoutActionColumns: HeaderGroup<any>[] = columns.map(
      (column) => ({
        ...column,
        ...commonHeaderGroupProps,
      })
    ) as HeaderGroup<any>[];

    const headersWithActionColumns: HeaderGroup<any>[] = [
      {
        id: 'selection',
        Header: '',
        width: '30px',
        ...commonHeaderGroupProps,
      },
      {
        id: 'expansion',
        Header: '',
        width: '50px',
        ...commonHeaderGroupProps,
      },
      ...headersWithoutActionColumns,
    ];

    it('should return sticky column styles for sticky columns only', () => {
      expect(
        getStickyColumnHeadersStyles(headersWithoutActionColumns, columns)
      ).toEqual([
        {
          position: 'sticky',
          left: 0,
          zIndex: layers.TABLE_STICKY_COLUMN_HEADER,
        },
        undefined,
        undefined,
      ]);
    });

    it('should return sticky column styles for sticky columns and action columns', () => {
      expect(
        getStickyColumnHeadersStyles(headersWithActionColumns, columns)
      ).toEqual([
        {
          position: 'sticky',
          left: 0,
          zIndex: layers.TABLE_STICKY_COLUMN_HEADER,
        },
        {
          position: 'sticky',
          left: 30,
          zIndex: layers.TABLE_STICKY_COLUMN_HEADER,
        },
        {
          position: 'sticky',
          left: 80,
          zIndex: layers.TABLE_STICKY_COLUMN_HEADER,
        },
        undefined,
        undefined,
      ]);
    });
  });

  describe('getStickyColumnCellsStyles', () => {
    const cellsWithoutActionColumns: Cell<any>[] = columns.map((column) => ({
      column: {
        ...column,
        ...commonHeaderGroupProps,
      } as HeaderGroup<any>,
      ...commonCellProps,
    }));

    const cellsWithActionColumns: Cell<any>[] = [
      {
        column: {
          id: 'selection',
          Header: '',
          width: '30px',
          ...commonHeaderGroupProps,
        },
        ...commonCellProps,
      },
      {
        column: {
          id: 'expansion',
          Header: '',
          width: '50px',
          ...commonHeaderGroupProps,
        },
        ...commonCellProps,
      },
      ...cellsWithoutActionColumns,
    ];

    it('should return sticky column styles for sticky columns only', () => {
      expect(
        getStickyColumnCellsStyles(cellsWithoutActionColumns, columns)
      ).toEqual([
        {
          position: 'sticky',
          left: 0,
          zIndex: layers.TABLE_STICKY_COLUMN_CELL,
        },
        undefined,
        undefined,
      ]);
    });

    it('should return sticky column styles for sticky columns and action columns', () => {
      expect(
        getStickyColumnCellsStyles(cellsWithActionColumns, columns)
      ).toEqual([
        {
          position: 'sticky',
          left: 0,
          zIndex: layers.TABLE_STICKY_COLUMN_CELL,
        },
        {
          position: 'sticky',
          left: 30,
          zIndex: layers.TABLE_STICKY_COLUMN_CELL,
        },
        {
          position: 'sticky',
          left: 80,
          zIndex: layers.TABLE_STICKY_COLUMN_CELL,
        },
        undefined,
        undefined,
      ]);
    });
  });
});
