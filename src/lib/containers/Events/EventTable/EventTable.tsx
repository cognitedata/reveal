import React from 'react';
import { CogniteEvent } from '@cognite/sdk';
import { Table, TableProps } from 'lib/components';

export const EventTable = ({
  items,
  onItemClicked,
  ...props
}: {
  items: CogniteEvent[];
  onItemClicked: (event: CogniteEvent) => void;
} & TableProps<CogniteEvent>) => {
  const columns = [
    Table.Columns.type,
    Table.Columns.subtype,
    Table.Columns.description,
    Table.Columns.externalId,
    Table.Columns.relationships,
    Table.Columns.lastUpdatedTime,
    Table.Columns.createdTime,
  ];

  return (
    <Table<CogniteEvent>
      data={items}
      columns={columns}
      onRowClick={onItemClicked}
      {...props}
    />
  );
};
