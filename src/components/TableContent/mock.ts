import { ColumnShape } from 'react-base-table';
import { FilterType } from 'components/TableContent/components';

export const activeFilters: FilterType[] = [
  {
    type: 'columns',
    value: 13,
  },
  {
    type: 'integers',
    value: 7,
  },
  {
    type: 'strings',
    value: 6,
  },
];
const mockColumns = new Array(10).fill(0).map((_, i) => i);
const mockData = new Array(50).fill(0).map((_, i) => i);

export const getColumns = (): ColumnShape<unknown>[] => {
  const indexColumn = {
    key: `column-index`,
    dataKey: `column-index`,
    title: '',
    width: 36,
    flexGrow: 1,
    flexShrink: 0,
    frozen: true,
  };
  const otherColumns = mockColumns.map((index) => ({
    key: `column-${index}`,
    dataKey: `column-${index}`,
    title: `Column ${index}`,
    width: 200,
    flexGrow: 1,
    flexShrink: 0,
  }));
  return [indexColumn, ...otherColumns];
};

export const getRows = (): unknown[] => {
  const rows = mockData.map((index) => {
    const row: Record<string, unknown> = {
      id: `row-${index}`,
      parentId: null,
    };
    const columns = getColumns();
    columns.forEach((column) => {
      if (column.key === 'column-index') row[column.key] = index + 1;
      else row[column.key] = `Row ${index}, ${column.title}`;
    });
    return row;
  });
  return rows;
};
