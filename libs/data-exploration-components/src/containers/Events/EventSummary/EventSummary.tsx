import { Asset, CogniteEvent } from '@cognite/sdk';
import { ColumnDef } from '@tanstack/react-table';

import {
  ResourceTableColumns,
  SummaryCardWrapper,
  Table,
} from '@data-exploration-components/components/Table';
import React, { useMemo } from 'react';

import {
  useEventsMetadataKeys,
  useEventsSearchResultWithLabelsQuery,
  InternalEventDataWithMatchingLabels,
} from '@data-exploration-lib/domain-layer';
import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import noop from 'lodash/noop';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';
import { SubCellMatchingLabels } from '@data-exploration-components/components/Table/components/SubCellMatchingLabel';
import { InternalEventsFilters } from '@data-exploration-lib/core';

export const EventSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick = noop,
  onDirectAssetClick = noop,
  isAdvancedFiltersEnabled = false,
}: {
  query?: string;
  filter: InternalEventsFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: CogniteEvent) => void;
  onDirectAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  isAdvancedFiltersEnabled?: boolean;
}) => {
  const { data, isLoading } = useEventsSearchResultWithLabelsQuery({
    query,
    eventsFilters: filter,
  });
  const { data: metadataKeys = [] } = useEventsMetadataKeys();

  const metadataColumns = useMemo(() => {
    return metadataKeys.map((key) => ResourceTableColumns.metadata(key));
  }, [metadataKeys]);

  const columns = useMemo(
    () =>
      [
        Table.Columns.type(),
        Table.Columns.subtype(),
        Table.Columns.description(),
        Table.Columns.externalId(),
        Table.Columns.lastUpdatedTime,
        Table.Columns.created,
        Table.Columns.id(),
        Table.Columns.dataSet,
        Table.Columns.startTime,
        Table.Columns.endTime,
        Table.Columns.source(),
        Table.Columns.assets(onDirectAssetClick),
        ...metadataColumns,
      ] as ColumnDef<CogniteEvent>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns]
  );

  const hiddenColumns = useGetHiddenColumns(columns, ['type', 'description']);

  return (
    <SummaryCardWrapper>
      <Table<InternalEventDataWithMatchingLabels>
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={getSummaryCardItems(data)}
        columnSelectionLimit={2}
        id="events-summary-table"
        isDataLoading={isLoading}
        tableHeaders={
          <SummaryHeader
            icon="Events"
            title="Events"
            onAllResultsClick={onAllResultsClick}
          />
        }
        enableColumnResizing={false}
        onRowClick={onRowClick}
        renderCellSubComponent={
          isAdvancedFiltersEnabled ? SubCellMatchingLabels : undefined
        }
      />
    </SummaryCardWrapper>
  );
};
