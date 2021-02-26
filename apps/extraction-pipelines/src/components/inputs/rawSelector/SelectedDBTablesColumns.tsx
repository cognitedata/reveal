import { CellProps, Column } from 'react-table';
import { createLink } from '@cognite/cdf-utilities';
import React from 'react';
import { SelectedTable } from './RawSelector';

export const SelectionColumns: Column<SelectedTable>[] = [
  {
    Header: 'Database selected',
    accessor: 'databaseName',
    Cell: ({ row }: CellProps<SelectedTable>) => (
      <a
        href={createLink(`/raw/${row.original.databaseName}`)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {row.original.databaseName}
      </a>
    ),
  },
  {
    Header: 'Table Selected',
    accessor: 'tableName',
    Cell: ({ row }: CellProps<SelectedTable>) => (
      <a
        data-testid="selected-table"
        href={createLink(
          `/raw/${row.original.databaseName}/${row.original.tableName}`
        )}
        target="_blank"
        rel="noopener noreferrer"
      >
        {row.original.tableName}
      </a>
    ),
  },
];
