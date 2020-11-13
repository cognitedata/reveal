import React from 'react';
import { CogniteEvent } from '@cognite/sdk';
import { Table, TableProps } from 'lib/components';

export const EventTable = (props: TableProps<CogniteEvent>) => {
  const columns = [
    Table.Columns.type,
    Table.Columns.description,
    Table.Columns.subtype,
    Table.Columns.externalId,
    Table.Columns.relationships,
    Table.Columns.lastUpdatedTime,
    Table.Columns.createdTime,
  ];

  return <Table<CogniteEvent> columns={columns} {...props} />;
};
