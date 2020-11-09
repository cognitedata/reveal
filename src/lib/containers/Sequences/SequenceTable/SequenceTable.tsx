import React from 'react';
import { Sequence } from '@cognite/sdk';
import { Table, TableProps } from 'lib/components';

export const SequenceTable = ({
  items,
  onItemClicked,
  ...props
}: {
  items: Sequence[];
  onItemClicked: (sequence: Sequence) => void;
} & TableProps<Sequence>) => {
  const columns = [
    Table.Columns.name,
    Table.Columns.externalId,
    Table.Columns.columns,
    Table.Columns.relationships,
    Table.Columns.lastUpdatedTime,
    Table.Columns.createdTime,
  ];

  return (
    <Table<Sequence>
      data={items}
      columns={columns}
      onRowClick={onItemClicked}
      {...props}
    />
  );
};
