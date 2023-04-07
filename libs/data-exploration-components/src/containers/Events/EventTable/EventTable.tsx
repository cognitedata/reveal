import React, { useMemo } from 'react';
import { Asset, CogniteEvent } from '@cognite/sdk';

import {
  SubCellMatchingLabels,
  Table,
  TableProps,
} from '@data-exploration/components';

import { RelationshipLabels } from '@data-exploration-components/types';
import { ColumnDef } from '@tanstack/react-table';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';
import { InternalEventDataWithMatchingLabels } from '@data-exploration-lib/domain-layer';
import { useEventsMetadataColumns } from '@data-exploration-components/containers/Events/hooks/useEventsMetadataColumns';

export type EventWithRelationshipLabels = RelationshipLabels & CogniteEvent;

const visibleColumns = ['type', 'description'];
export const EventTable = ({
  query,
  onDirectAssetClick,
  ...rest
}: Omit<TableProps<EventWithRelationshipLabels>, 'columns'> & {
  onDirectAssetClick?: (directAsset: Asset, resourceId?: number) => void;
}) => {
  const { metadataColumns, setMetadataKeyQuery } = useEventsMetadataColumns();

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
        { ...Table.Columns.dataSet, enableSorting: true },
        Table.Columns.startTime,
        Table.Columns.endTime,
        Table.Columns.source(),
        Table.Columns.assets(onDirectAssetClick),
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
      renderCellSubComponent={SubCellMatchingLabels}
      onChangeSearchInput={setMetadataKeyQuery}
      {...rest}
    />
  );
};
