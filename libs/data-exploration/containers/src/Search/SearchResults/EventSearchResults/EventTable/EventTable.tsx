import React, { useMemo } from 'react';

import {
  getHighlightQuery,
  getTableColumns,
  SubCellMatchingLabels,
  Table,
  TableProps,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { Asset, CogniteEvent } from '@cognite/sdk';

import {
  getHiddenColumns,
  RelationshipLabels,
  useGetSearchConfigFromLocalStorage,
  useTranslation,
} from '@data-exploration-lib/core';
import { InternalEventDataWithMatchingLabels } from '@data-exploration-lib/domain-layer';

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
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);
  const eventSearchConfig = useGetSearchConfigFromLocalStorage('event');

  const columns = useMemo(
    () =>
      [
        {
          ...tableColumns.type(
            getHighlightQuery(eventSearchConfig?.type.enabled, query)
          ),
          enableHiding: false,
        },
        tableColumns.subtype(
          getHighlightQuery(eventSearchConfig?.subtype.enabled, query)
        ),
        tableColumns.description(
          getHighlightQuery(eventSearchConfig?.description.enabled, query)
        ),
        tableColumns.externalId(
          getHighlightQuery(eventSearchConfig?.externalId.enabled, query)
        ),
        tableColumns.lastUpdatedTime,
        tableColumns.created,
        {
          ...tableColumns.id(
            getHighlightQuery(eventSearchConfig?.id.enabled, query)
          ),
          enableSorting: false,
        },
        { ...tableColumns.dataSet, enableSorting: true },
        tableColumns.startTime,
        tableColumns.endTime,
        tableColumns.source(
          getHighlightQuery(eventSearchConfig?.source.enabled, query)
        ),
        tableColumns.assets(onDirectAssetClick),
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
