import { CogniteEvent } from '@cognite/sdk';
import { ColumnDef } from '@tanstack/react-table';

import { InternalSequenceFilters } from '@data-exploration-components/domain/sequence';
import { Table } from '@data-exploration-components/components/Table';
import React, { useMemo } from 'react';

import { EmptyState } from '@data-exploration-components/components/EmpyState/EmptyState';
import { SummaryCard } from '@data-exploration-components/components/SummaryCard/SummaryCard';
import { useEventsSearchResultQuery } from '@data-exploration-components/domain/events';
import { getSummaryCardItems } from '@data-exploration-components/components/SummaryCard/utils';
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
        Table.Columns.type(query),
        Table.Columns.description(query),
      ] as ColumnDef<CogniteEvent>[],
    [query]
  );

  return (
    <SummaryCard
      icon="Events"
      title="Events"
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
