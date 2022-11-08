import { Sequence } from '@cognite/sdk/dist/src';
import { ColumnDef } from '@tanstack/react-table';
import { useResourceResults } from 'containers';
import { InternalSequenceFilters } from 'domain/sequence';
import { TableV2 as Table } from 'components/ReactTable/V2';
import React, { useMemo } from 'react';
import { convertResourceType } from 'types';

import { EmptyState } from 'components/EmpyState/EmptyState';
import { SummaryCard } from 'components/SummaryCard/SummaryCard';
import { getSummaryCardItems } from 'components/SummaryCard/utils';

export const SequenceSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
}: {
  query?: string;
  filter: InternalSequenceFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}) => {
  const api = convertResourceType('sequence');

  const { isFetched, items } = useResourceResults<Sequence>(api, query, filter);
  const columns = useMemo(
    () =>
      [Table.Columns.name, Table.Columns.description] as ColumnDef<Sequence>[],
    []
  );

  if (!isFetched) {
    return <EmptyState isLoading={!isFetched} />;
  }
  return (
    <SummaryCard
      icon="Sequences"
      title="Sequence"
      onAllResultsClick={onAllResultsClick}
    >
      <Table
        data={getSummaryCardItems(items)}
        id="sequence-summary-table"
        columns={columns}
        enableColumnResizing={false}
      />
    </SummaryCard>
  );
};
