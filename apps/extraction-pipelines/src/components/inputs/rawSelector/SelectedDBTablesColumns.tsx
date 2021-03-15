import { CellProps, Column } from 'react-table';
import { createLink } from '@cognite/cdf-utilities';
import React from 'react';
import { IntegrationRawTable } from 'model/Integration';

export const SelectionColumns: Column<IntegrationRawTable>[] = [
  {
    Header: 'Database selected',
    accessor: 'dbName',
    Cell: ({ row }: CellProps<IntegrationRawTable>) => (
      <a
        href={createLink(`/raw/${row.original.dbName}`)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {row.original.dbName}
      </a>
    ),
  },
  {
    Header: 'Table Selected',
    accessor: 'tableName',
    Cell: ({ row }: CellProps<IntegrationRawTable>) => (
      <a
        data-testid="selected-table"
        href={createLink(
          `/raw/${row.original.dbName}/${row.original.tableName}`
        )}
        target="_blank"
        rel="noopener noreferrer"
      >
        {row.original.tableName}
      </a>
    ),
  },
];
