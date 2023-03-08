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
  SummaryCardWrapper,
  Table,
} from '@data-exploration-components/components/Table';
import React, { useMemo } from 'react';

import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';
import { EMPTY_OBJECT } from '@data-exploration-lib/core';

import { SubCellMatchingLabels } from '@data-exploration-components/components/Table/components/SubCellMatchingLabel';

export const SequenceSummary = ({
  query = '',
  filter = EMPTY_OBJECT,
  onAllResultsClick,
  onRowClick,
  onRootAssetClick,
  isAdvancedFiltersEnabled = false,
}: {
  query?: string;
  filter: InternalSequenceFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: Sequence) => void;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  isAdvancedFiltersEnabled?: boolean;
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
        Table.Columns.dataSet,
        ...metadataColumns,
      ] as ColumnDef<Sequence>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns]
  );

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
