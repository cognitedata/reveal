import { Asset } from '@cognite/sdk';
import { ColumnDef } from '@tanstack/react-table';

import { InternalSequenceFilters } from 'domain/sequence';
import { TableV2 as Table } from 'components/ReactTable/V2';
import React, { useMemo } from 'react';

import { EmptyState } from 'components/EmpyState/EmptyState';
import { SummaryCard } from 'components/SummaryCard/SummaryCard';

import { useAssetsSearchResultQuery } from 'domain/assets';
import { getSummaryCardItems } from 'components/SummaryCard/utils';
import { noop } from 'lodash';

export const AssetSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick = noop,
}: {
  query?: string;
  onRowClick?: (row: Asset) => void;
  filter: InternalSequenceFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}) => {
  const { data, isLoading } = useAssetsSearchResultQuery({
    query,
    assetFilter: filter,
  });
  const columns = useMemo(
    () => [Table.Columns.name, Table.Columns.description] as ColumnDef<Asset>[],
    []
  );

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }
  return (
    <SummaryCard
      icon="Assets"
      title="Assets"
      onAllResultsClick={onAllResultsClick}
    >
      <Table
        data={getSummaryCardItems(data)}
        id="assets-summary-table"
        columns={columns}
        enableColumnResizing={false}
        onRowClick={onRowClick}
      />
    </SummaryCard>
  );
};
