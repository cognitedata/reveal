import React, { useMemo } from 'react';
import { CogniteEvent } from '@cognite/sdk';

import { Table, TableProps } from 'components/Table/Table';

import { RelationshipLabels } from 'types';
import { ColumnDef } from '@tanstack/react-table';
import { useGetHiddenColumns } from 'hooks';
import { sampleMetadataValue } from 'components/Table/mockData';
import { DASH } from 'utils';

export type EventWithRelationshipLabels = RelationshipLabels & CogniteEvent;

const visibleColumns = ['type', 'description'];
export const EventTable = (
  props: Omit<TableProps<EventWithRelationshipLabels>, 'columns'>
) => {
  const metadataColumns: ColumnDef<CogniteEvent>[] = sampleMetadataValue.map(
    item => ({
      id: `metadata:${item.value}`,
      accessorFn: data => data?.metadata?.[item.value] || DASH,
      header: item.value,
      meta: {
        isMetadata: true,
      },
      enableSorting: false,
    })
  );

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

  const combinedColumns = useMemo(
    () => [...columns, ...metadataColumns],
    [columns, metadataColumns]
  );
  const hiddenColumns = useGetHiddenColumns(combinedColumns, visibleColumns);

  return (
    <Table<CogniteEvent>
      columns={combinedColumns}
      hiddenColumns={hiddenColumns}
      {...props}
    />
  );
};
