import { Asset, Sequence } from '@cognite/sdk';
import { ColumnDef } from '@tanstack/react-table';

import {
  InternalSequenceFilters,
  useSequenceSearchResultWithMatchingLabelsQuery,
  InternalSequenceDataWithMatchingLabels,
  useSequencesMetadataKeys,
} from '@data-exploration-lib/domain-layer';
import {
  ResourceTableColumns,
  SubRowMatchingLabel,
  SummaryCardWrapper,
  Table,
} from '@data-exploration-components/components/Table';
import React, { useMemo } from 'react';

import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';
import { EMPTY_OBJECT } from '@data-exploration-lib/core';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks/flags/useFlagAdvancedFilters';
import { SubCellMatchingLabels } from '@data-exploration-components/components/Table/components/SubCellMatchingLabel';

export const SequenceSummary = ({
  query = '',
  filter = EMPTY_OBJECT,
  onAllResultsClick,
  onRowClick,
  onRootAssetClick,
}: {
  query?: string;
  filter: InternalSequenceFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: Sequence) => void;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
}) => {
  const { isLoading, data } = useSequenceSearchResultWithMatchingLabelsQuery({
    filter,
    query,
  });
  const { data: metadataKeys = [] } = useSequencesMetadataKeys();

  const metadataColumns = useMemo(() => {
    return metadataKeys.map((key: string) =>
      ResourceTableColumns.metadata(key)
    );
  }, [metadataKeys]);
  const columns = useMemo(
    () =>
      [
        Table.Columns.name(),
        Table.Columns.description(),
        Table.Columns.externalId(),
        Table.Columns.columns,
        Table.Columns.lastUpdatedTime,
        Table.Columns.created,
        Table.Columns.id(query),
        Table.Columns.rootAsset(onRootAssetClick),
        Table.Columns.dataset,
        ...metadataColumns,
      ] as ColumnDef<Sequence>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns]
  );
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();

  const hiddenColumns = useGetHiddenColumns(columns, ['name', 'description']);

  return (
    <SummaryCardWrapper>
      <Table<InternalSequenceDataWithMatchingLabels>
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={getSummaryCardItems(data)}
        columnSelectionLimit={2}
        id="sequence-summary-table"
        isDataLoading={isLoading}
        tableHeaders={
          <SummaryHeader
            icon="Sequences"
            title="Sequence"
            onAllResultsClick={onAllResultsClick}
          />
        }
        enableColumnResizing={false}
        onRowClick={onRowClick}
        renderCellSubComponent={
          isAdvancedFiltersEnabled ? SubCellMatchingLabels : undefined
        }
        query={query}
      />
    </SummaryCardWrapper>
  );
};
