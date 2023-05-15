import { getHiddenColumns } from '@data-exploration-lib/core';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import {
  SubCellMatchingLabels,
  Table,
  TableProps,
} from '@data-exploration/components';

import {
  AssetWithRelationshipLabels,
  InternalAssetDataWithMatchingLabels,
} from '@data-exploration-lib/domain-layer';
import { useAssetsMetadataColumns } from '../useAssetsMetadataColumns';

import { ThreeDModelCell } from './ThreeDModelCell';
import noop from 'lodash/noop';

const visibleColumns = ['name', 'rootId'];
export const AssetTable = ({
  onRowClick = noop,
  data,
  query,
  ...rest
}: Omit<TableProps<AssetWithRelationshipLabels>, 'columns'>) => {
  const { metadataColumns, setMetadataKeyQuery } = useAssetsMetadataColumns();

  const columns = useMemo(
    () =>
      [
        {
          ...Table.Columns.name(query),
          enableHiding: false,
        },
        Table.Columns.description(query),
        Table.Columns.externalId(query),
        Table.Columns.rootAsset((rootAsset) => onRowClick(rootAsset)),
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
        Table.Columns.source(query),
        { ...Table.Columns.dataSet, enableSorting: true },
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
