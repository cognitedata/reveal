import { useMemo } from 'react';

import {
  getTableColumns,
  SubCellMatchingLabels,
  Table,
  TableProps,
  getHighlightQuery,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';
import noop from 'lodash/noop';

import {
  getHiddenColumns,
  useGetSearchConfigFromLocalStorage,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  AssetWithRelationshipLabels,
  InternalAssetDataWithMatchingLabels,
} from '@data-exploration-lib/domain-layer';

import { useAssetsMetadataColumns } from '../useAssetsMetadataColumns';

const visibleColumns = ['name', 'rootId'];
export const AssetTable = ({
  onRowClick = noop,
  data,
  query,
  ...rest
}: Omit<TableProps<AssetWithRelationshipLabels>, 'columns'>) => {
  const { metadataColumns, setMetadataKeyQuery } = useAssetsMetadataColumns();
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);
  const assetSearchConfig = useGetSearchConfigFromLocalStorage('asset');

  const columns = useMemo(
    () =>
      [
        {
          ...tableColumns.name(
            getHighlightQuery(assetSearchConfig?.name.enabled, query)
          ),
          enableHiding: false,
        },
        tableColumns.description(
          getHighlightQuery(assetSearchConfig?.description.enabled, query)
        ),
        tableColumns.externalId(
          getHighlightQuery(assetSearchConfig?.externalId.enabled, query)
        ),
        tableColumns.rootAsset((rootAsset) => onRowClick(rootAsset)),
        tableColumns.availabilityThreeD,
        tableColumns.created,
        {
          ...tableColumns.labels,
          enableSorting: false,
        },
        tableColumns.source(
          getHighlightQuery(assetSearchConfig?.source.enabled, query)
        ),
        { ...tableColumns.dataSet, enableSorting: true },
        ...metadataColumns,
      ] as ColumnDef<AssetWithRelationshipLabels>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns, query]
  );

  const hiddenColumns = getHiddenColumns(columns, visibleColumns);

  return (
    <Table<InternalAssetDataWithMatchingLabels>
      data={data || []}
      columns={columns}
      onRowClick={onRowClick}
      hiddenColumns={hiddenColumns}
      renderCellSubComponent={SubCellMatchingLabels}
      onChangeSearchInput={setMetadataKeyQuery}
      {...rest}
    />
  );
};
