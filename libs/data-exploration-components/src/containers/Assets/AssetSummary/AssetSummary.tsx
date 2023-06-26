import React, { useMemo } from 'react';

import {
  getTableColumns,
  SubCellMatchingLabels,
  SummaryCardWrapper,
  Table,
  ThreeDModelCell,
} from '@data-exploration/components';
import { useAssetsMetadataColumns } from '@data-exploration/containers';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';
import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import { ColumnDef } from '@tanstack/react-table';
import noop from 'lodash/noop';

import { Asset } from '@cognite/sdk';

import {
  getHiddenColumns,
  InternalSequenceFilters,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  AssetWithRelationshipLabels,
  InternalAssetDataWithMatchingLabels,
  useAssetsSearchResultWithLabelsQuery,
} from '@data-exploration-lib/domain-layer';

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

  const { metadataColumns, setMetadataKeyQuery } = useAssetsMetadataColumns();
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const columns = useMemo(
    () =>
      [
        tableColumns.name(),
        tableColumns.description(),
        tableColumns.externalId(),
        tableColumns.rootAsset(onRowClick),
        {
          accessorKey: 'id',
          header: t('3D_AVAILABILITY', '3D availability'),
          cell: ({ getValue }) => (
            <ThreeDModelCell assetId={getValue<number>()} />
          ),
          size: 300,
          enableSorting: false,
        },
        tableColumns.created,
        {
          ...tableColumns.labels,
          enableSorting: false,
        },
        tableColumns.source(),
        tableColumns.dataSet,
        ...metadataColumns,
      ] as ColumnDef<AssetWithRelationshipLabels>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns]
  );

  const hiddenColumns = getHiddenColumns(columns, ['name', 'description']);

  return (
    <SummaryCardWrapper>
      <Table<InternalAssetDataWithMatchingLabels>
        id="asset-summary-table"
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={getSummaryCardItems(data)}
        columnSelectionLimit={2}
        isDataLoading={isLoading}
        tableHeaders={
          <SummaryHeader
            icon="Assets"
            title={t('ASSETS', 'Assets')}
            onAllResultsClick={onAllResultsClick}
          />
        }
        enableColumnResizing={false}
        onRowClick={onRowClick}
        renderCellSubComponent={
          isAdvancedFiltersEnabled ? SubCellMatchingLabels : undefined
        }
        onChangeSearchInput={setMetadataKeyQuery}
      />
    </SummaryCardWrapper>
  );
};
