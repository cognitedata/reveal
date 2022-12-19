import { Timeseries } from '@cognite/sdk';
import { ColumnDef } from '@tanstack/react-table';
import { useResourceResults } from '@data-exploration-components/containers';
import { InternalSequenceFilters } from '@data-exploration-components/domain/sequence';
import { Table } from '@data-exploration-components/components/Table';
import React, { useMemo } from 'react';
import { convertResourceType } from '@data-exploration-components/types';

import { EmptyState } from '@data-exploration-components/components/EmpyState/EmptyState';
import { SummaryCard } from '@data-exploration-components/components/SummaryCard/SummaryCard';
import { getSummaryCardItems } from '@data-exploration-components/components/SummaryCard/utils';

export const TimeseriesSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick,
}: {
  query?: string;
  filter: InternalSequenceFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: Timeseries) => void;
}) => {
  const api = convertResourceType('timeSeries');

  const { isLoading, items } = useResourceResults<Timeseries>(
    api,
    query,
    filter
  );
  const columns = useMemo(
    () =>
      [
        Table.Columns.name(query),
        Table.Columns.description(query),
      ] as ColumnDef<Timeseries>[],
    [query]
  );

  return (
    <SummaryCard
      icon="Timeseries"
      title="Time series"
      onAllResultsClick={onAllResultsClick}
    >
      {isLoading ? (
        <EmptyState isLoading={isLoading} title="Loading results" />
      ) : (
        <Table
          onRowClick={onRowClick}
          data={getSummaryCardItems(items)}
          id="timseries-summary-table"
          columns={columns}
          enableColumnResizing={false}
        />
      )}
    </SummaryCard>
  );
};
