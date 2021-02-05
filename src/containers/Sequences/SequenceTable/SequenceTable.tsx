import React from 'react';
import { Sequence } from '@cognite/sdk';
import { Table, TableProps } from 'components';

export const SequenceTable = (props: TableProps<Sequence>) => {
  const columns = [
    Table.Columns.name,
    Table.Columns.description,
    Table.Columns.externalId,
    Table.Columns.columns,
    Table.Columns.relationships,
    Table.Columns.lastUpdatedTime,
    Table.Columns.createdTime,
  ];

  return <Table<Sequence> columns={columns} {...props} />;
};
