import React, { useMemo } from 'react';
import { CogniteEvent } from '@cognite/sdk';

import { Table, TableProps } from 'components/Table/Table';

import { RelationshipLabels } from 'types';
import { ColumnDef } from '@tanstack/react-table';
import { useGetHiddenColumns } from 'hooks';

export type EventWithRelationshipLabels = RelationshipLabels & CogniteEvent;

const visibleColumns = ['type', 'description'];
export const EventTable = (
  props: Omit<TableProps<EventWithRelationshipLabels>, 'columns'>
) => {
  const columns = useMemo(
    () =>
      [
        { ...Table.Columns.type, enableHiding: false },
        Table.Columns.description,
        Table.Columns.externalId,
        Table.Columns.lastUpdatedTime,
        Table.Columns.created,
        {
          ...Table.Columns.id,
          enableSorting: false,
        },
        {
          ...Table.Columns.dataSet,
          enableSorting: false,
        },
        Table.Columns.startTime,
        Table.Columns.endTime,
        Table.Columns.source,
        {
          ...Table.Columns.assets,
          enableSorting: false,
        },
      ] as ColumnDef<CogniteEvent>[],
    []
  );
  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  return (
    <Table<CogniteEvent>
      columns={columns}
      hiddenColumns={hiddenColumns}
      {...props}
    />
  );
};
