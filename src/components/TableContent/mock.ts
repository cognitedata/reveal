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

export const columns: ColumnShape<unknown>[] = mockColumns.map((index) => ({
  key: `column-${index}`,
  dataKey: `column-${index}`,
  title: `Column ${index}`,
  // fixed: false,
  width: 200,
  // flexGrow: 1,
}));

export const data: unknown[] = mockData.map((index) => {
  const row: Record<string, string | null> = {
    id: `row-${index}`,
    parentId: null,
  };
  columns.forEach((column) => {
    row[column.key] = `Row ${index}, ${column.title}`;
  });
  return row;
});
