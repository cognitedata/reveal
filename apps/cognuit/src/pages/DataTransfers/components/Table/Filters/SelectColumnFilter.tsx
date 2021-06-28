import React from 'react';
import { Select, TableProps } from '@cognite/cogs.js';

export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}: {
  column: {
    filterValue: any;
    setFilter: any;
    preFilteredRows: TableProps<any>['columns'][];
    id: any;
  }; // NOT EXPORTED: ColumnInstance<T>;
}) {
  const options = React.useMemo(() => {
    return preFilteredRows.reduce(
      (accumulator, row: any) => {
        const value = row.values[id];
        if (accumulator.some((item) => item.value === value)) {
          return accumulator;
        }
        return [...accumulator, { value, label: value }];
      },
      [{ value: undefined, label: 'Show all' }]
    );
  }, [id, preFilteredRows]);

  return (
    <Select
      theme="filled"
      value={{ value: filterValue, label: filterValue ?? 'Showing all' }}
      onChange={(e: any) => {
        setFilter(e.value);
      }}
      options={options}
    />
  );
}
