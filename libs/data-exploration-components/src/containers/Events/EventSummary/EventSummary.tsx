import { CogniteEvent, EventFilter } from '@cognite/sdk';
import { ColumnDef } from '@tanstack/react-table';

import {
  ResourceTableColumns,
  SummaryCardWrapper,
  Table,
} from '@data-exploration-components/components/Table';
import React, { useMemo } from 'react';

import {
  useEventsMetadataKeys,
  useEventsSearchResultQuery,
  InternalEventsFilters,
} from '@data-exploration-lib/domain-layer';
import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import noop from 'lodash/noop';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';

export const EventSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick = noop,
}: {
  query?: string;
  filter: InternalEventsFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: CogniteEvent) => void;
}) => {
  const { data, isLoading } = useEventsSearchResultQuery({
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
        Table.Columns.type(query),
        Table.Columns.subtype(query),
        Table.Columns.description(query),
        Table.Columns.externalId(query),
        Table.Columns.lastUpdatedTime,
        Table.Columns.created,
        Table.Columns.id(query),
        Table.Columns.dataSet,
        Table.Columns.startTime,
        Table.Columns.endTime,
        Table.Columns.source(query),
        Table.Columns.assets,
        ...metadataColumns,
      ] as ColumnDef<CogniteEvent>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, metadataColumns]
  );

  const hiddenColumns = useGetHiddenColumns(columns, ['type', 'description']);

  return (
    <SummaryCardWrapper>
      <Table
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
      />
    </SummaryCardWrapper>
  );
};
