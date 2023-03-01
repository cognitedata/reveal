import { Asset } from '@cognite/sdk';
import { ColumnDef } from '@tanstack/react-table';

import {
  InternalAssetDataWithMatchingLabels,
  InternalSequenceFilters,
  useAssetsMetadataKeys,
  useAssetsSearchResultWithLabelsQuery,
} from '@data-exploration-lib/domain-layer';
import {
  ResourceTableColumns,
  SummaryCardWrapper,
  Table,
} from '@data-exploration-components/components/Table';
import React, { useMemo } from 'react';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';

import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import noop from 'lodash/noop';

import { AssetWithRelationshipLabels } from '../AssetTable/AssetTable';
import { ThreeDModelCell } from '../AssetTable/ThreeDModelCell';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';
import { SubCellMatchingLabels } from '@data-exploration-components/components/Table/components/SubCellMatchingLabel';

export const AssetSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick = noop,
  isAdvancedFiltersEnabled = false,
}: {
  query?: string;
  onRowClick?: (row: Asset) => void;
  filter: InternalSequenceFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  isAdvancedFiltersEnabled?: boolean;
}) => {
  const { data, isLoading } = useAssetsSearchResultWithLabelsQuery({
    query,
    assetFilter: filter,
  });
  const { data: metadataKeys = [] } = useAssetsMetadataKeys();

  const metadataColumns = useMemo(() => {
    return metadataKeys.map((key) => ResourceTableColumns.metadata(key));
  }, [metadataKeys]);

  const columns = useMemo(
    () =>
      [
        Table.Columns.name(query),
        Table.Columns.description(query),
        Table.Columns.externalId(query),
        Table.Columns.rootAsset(onRowClick),
        {
          accessorKey: 'id',
          header: '3D availability',
          cell: ({ getValue }) => (
            <ThreeDModelCell assetId={getValue<number>()} />
          ),
          size: 300,
          enableSorting: false,
        },
        Table.Columns.created,
        {
          ...Table.Columns.labels,
          enableSorting: false,
        },
        Table.Columns.source(),
        Table.Columns.dataset,
        ...metadataColumns,
      ] as ColumnDef<AssetWithRelationshipLabels>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns]
  );

  const hiddenColumns = useGetHiddenColumns(columns, ['name', 'description']);

  return (
    <SummaryCardWrapper>
      <Table<InternalAssetDataWithMatchingLabels>
        id="asset-summary-table"
        columns={columns}
        query={query}
        hiddenColumns={hiddenColumns}
        data={getSummaryCardItems(data)}
        columnSelectionLimit={2}
        isDataLoading={isLoading}
        tableHeaders={
          <SummaryHeader
            icon="Assets"
            title="Assets"
            onAllResultsClick={onAllResultsClick}
          />
        }
        enableColumnResizing={false}
        onRowClick={onRowClick}
        renderCellSubComponent={
          isAdvancedFiltersEnabled ? SubCellMatchingLabels : undefined
        }
      />
    </SummaryCardWrapper>
  );
};
