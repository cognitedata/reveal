import { Timeseries } from '@cognite/sdk';
import { ColumnDef } from '@tanstack/react-table';
import { useResourceResults } from 'containers';
import { InternalSequenceFilters } from 'domain/sequence';
import { TableV2 as Table } from 'components/ReactTable/V2';
import React, { useMemo } from 'react';
import { convertResourceType } from 'types';

import { EmptyState } from 'components/EmpyState/EmptyState';
import { SummaryCard } from 'components/SummaryCard/SummaryCard';
import { getSummaryCardItems } from 'components/SummaryCard/utils';

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

  const { isFetched, items } = useResourceResults<Timeseries>(
    api,
    query,
    filter
  );
  const columns = useMemo(
    () =>
      [
        Table.Columns.name,
        Table.Columns.description,
      ] as ColumnDef<Timeseries>[],
    []
  );

  if (!isFetched) {
    return <EmptyState isLoading={!isFetched} />;
  }
  return (
    <SummaryCard
      icon="Timeseries"
      title="Timeseries"
      onAllResultsClick={onAllResultsClick}
    >
      <Table
        onRowClick={onRowClick}
        data={getSummaryCardItems(items)}
        id="timseries-summary-table"
        columns={columns}
        enableColumnResizing={false}
      />
    </SummaryCard>
  );
};
