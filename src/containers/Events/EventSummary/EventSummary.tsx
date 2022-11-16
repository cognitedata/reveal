import { CogniteEvent } from '@cognite/sdk';
import { ColumnDef } from '@tanstack/react-table';

import { InternalSequenceFilters } from 'domain/sequence';
import { TableV2 as Table } from 'components/ReactTable/V2';
import React, { useMemo } from 'react';

import { EmptyState } from 'components/EmpyState/EmptyState';
import { SummaryCard } from 'components/SummaryCard/SummaryCard';
import { useEventsSearchResultQuery } from 'domain/events';
import { getSummaryCardItems } from 'components/SummaryCard/utils';
import { noop } from 'lodash';

export const EventSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick = noop,
}: {
  query?: string;
  filter: InternalSequenceFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: CogniteEvent) => void;
}) => {
  const { data, isLoading } = useEventsSearchResultQuery({
    query,
    eventsFilters: filter,
  });

  const columns = useMemo(
    () =>
      [
        Table.Columns.type,
        {
          accessorKey: 'subtype',
          header: () => 'Subtype',
        },
      ] as ColumnDef<CogniteEvent>[],
    []
  );

  return (
    <SummaryCard
      icon="Events"
      title="Event"
      onAllResultsClick={onAllResultsClick}
    >
      {isLoading ? (
        <EmptyState isLoading={isLoading} title="Loading results" />
      ) : (
        <Table
          onRowClick={onRowClick}
          data={getSummaryCardItems(data)}
          id="events-summary-table"
          columns={columns}
          enableColumnResizing={false}
        />
      )}
    </SummaryCard>
  );
};
