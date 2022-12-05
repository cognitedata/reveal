import React, { useMemo } from 'react';
import { CogniteEvent } from '@cognite/sdk';

import { Table, TableProps } from 'components/Table/Table';

import { RelationshipLabels } from 'types';
import { ColumnDef } from '@tanstack/react-table';
import { useGetHiddenColumns } from 'hooks';
import { ResourceTableColumns } from '../../../components';
import { useEventsMetadataKeys } from '../../../domain';

export type EventWithRelationshipLabels = RelationshipLabels & CogniteEvent;

const visibleColumns = ['type', 'description'];
export const EventTable = ({
  query,
  ...rest
}: Omit<TableProps<EventWithRelationshipLabels>, 'columns'>) => {
  const { data: metadataKeys } = useEventsMetadataKeys();

  const metadataColumns: ColumnDef<CogniteEvent>[] = useMemo(() => {
    return (metadataKeys || []).map((key: string) =>
      ResourceTableColumns.metadata(key)
    );
  }, [metadataKeys]);

  const columns = useMemo(
    () =>
      [
        { ...Table.Columns.type(query), enableHiding: false },
        Table.Columns.subtype,
        Table.Columns.description(query),
        Table.Columns.externalId(query),
        Table.Columns.lastUpdatedTime,
        Table.Columns.created,
        {
          ...Table.Columns.id(query),
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
        ...metadataColumns,
      ] as ColumnDef<CogniteEvent>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, metadataColumns]
  );

  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  return (
    <Table<CogniteEvent>
      columns={columns}
      hiddenColumns={hiddenColumns}
      {...rest}
    />
  );
};
