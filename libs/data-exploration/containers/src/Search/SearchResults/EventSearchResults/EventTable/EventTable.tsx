import React, { useMemo } from 'react';

import {
  SubCellMatchingLabels,
  Table,
  TableProps,
} from '@data-exploration/components';
import {
  getHiddenColumns,
  RelationshipLabels,
} from '@data-exploration-lib/core';
import { InternalEventDataWithMatchingLabels } from '@data-exploration-lib/domain-layer';
import { ColumnDef } from '@tanstack/react-table';

import { Asset, CogniteEvent } from '@cognite/sdk';

import { useEventsMetadataColumns } from '../useEventsMetadataColumns';

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
        { ...Table.Columns.type(query), enableHiding: false },
        Table.Columns.subtype(query),
        Table.Columns.description(query),
        Table.Columns.externalId(query),
        Table.Columns.lastUpdatedTime,
        Table.Columns.created,
        {
          ...Table.Columns.id(query),
          enableSorting: false,
        },
        { ...Table.Columns.dataSet, enableSorting: true },
        Table.Columns.startTime,
        Table.Columns.endTime,
        Table.Columns.source(query),
        Table.Columns.assets(onDirectAssetClick),
        ...metadataColumns,
      ] as ColumnDef<CogniteEvent>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, metadataColumns]
  );

  const hiddenColumns = getHiddenColumns(columns, visibleColumns);

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
