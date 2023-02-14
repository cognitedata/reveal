import React, { useMemo } from 'react';
import { CogniteEvent } from '@cognite/sdk';

import {
  Table,
  TableProps,
} from '@data-exploration-components/components/Table/Table';

import { RelationshipLabels } from '@data-exploration-components/types';
import { ColumnDef } from '@tanstack/react-table';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';
import { ResourceTableColumns, SubRowMatchingLabel } from '../../../components';
import {
  InternalEventDataWithMatchingLabels,
  useEventsMetadataKeys,
} from '@data-exploration-lib/domain-layer';

export type EventWithRelationshipLabels = RelationshipLabels & CogniteEvent;

const visibleColumns = ['type', 'description'];
export const EventTable = ({
  query,
  ...rest
}: Omit<TableProps<EventWithRelationshipLabels>, 'columns'>) => {
  const { data: metadataKeys = [] } = useEventsMetadataKeys();

  const metadataColumns = useMemo(() => {
    return metadataKeys.map((key) => ResourceTableColumns.metadata(key));
  }, [metadataKeys]);

  const columns = useMemo(
    () =>
      [
        { ...Table.Columns.type(), enableHiding: false },
        Table.Columns.subtype(),
        Table.Columns.description(),
        Table.Columns.externalId(),
        Table.Columns.lastUpdatedTime,
        Table.Columns.created,
        {
          ...Table.Columns.id(),
          enableSorting: false,
        },
        {
          ...Table.Columns.dataset,
          enableSorting: false,
        },
        Table.Columns.startTime,
        Table.Columns.endTime,
        Table.Columns.source(),
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
    <Table<InternalEventDataWithMatchingLabels>
      columns={columns}
      hiddenColumns={hiddenColumns}
      renderRowSubComponent={SubRowMatchingLabel}
      {...rest}
    />
  );
};
