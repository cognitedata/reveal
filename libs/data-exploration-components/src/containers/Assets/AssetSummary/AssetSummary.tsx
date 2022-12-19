import { Asset } from '@cognite/sdk';
import { ColumnDef } from '@tanstack/react-table';

import { InternalSequenceFilters } from '@data-exploration-components/domain/sequence';
import { Table } from '@data-exploration-components/components/Table';
import React, { useMemo } from 'react';

import { EmptyState } from '@data-exploration-components/components/EmpyState/EmptyState';
import { SummaryCard } from '@data-exploration-components/components/SummaryCard/SummaryCard';

import { useAssetsSearchResultQuery } from '@data-exploration-components/domain/assets';
import { getSummaryCardItems } from '@data-exploration-components/components/SummaryCard/utils';
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
    () =>
      [
        Table.Columns.name(query),
        Table.Columns.description(query),
      ] as ColumnDef<Asset>[],
    [query]
  );

  return (
    <SummaryCard
      icon="Assets"
      title="Assets"
      onAllResultsClick={onAllResultsClick}
    >
      {isLoading ? (
        <EmptyState isLoading={isLoading} title="Loading results" />
      ) : (
        <Table
          data={getSummaryCardItems(data)}
          id="assets-summary-table"
          columns={columns}
          enableColumnResizing={false}
          onRowClick={onRowClick}
        />
      )}
    </SummaryCard>
  );
};
