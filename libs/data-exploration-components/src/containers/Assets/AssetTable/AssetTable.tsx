import { useMemo } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import isEmpty from 'lodash/isEmpty';

import {
  Table,
  TableProps,
} from '@data-exploration-components/components/Table/Table';
import { RelationshipLabels } from '@data-exploration-components/types';

import { useGetHiddenColumns } from '@data-exploration-components/hooks';

import { ResourceTableColumns, SubRowMatchingLabel } from '../../../components';
import {
  InternalAssetDataWithMatchingLabels,
  useAssetsMetadataKeys,
} from '@data-exploration-lib/domain-layer';

import { ThreeDModelCell } from './ThreeDModelCell';
import noop from 'lodash/noop';

export type AssetWithRelationshipLabels = RelationshipLabels &
  InternalAssetDataWithMatchingLabels;

const visibleColumns = ['name', 'rootId'];
export const AssetTable = ({
  onRowClick = noop,
  data,
  query,
  ...rest
}: Omit<TableProps<AssetWithRelationshipLabels>, 'columns'>) => {
  const { data: metadataKeys = [] } = useAssetsMetadataKeys();

  const metadataColumns = useMemo(() => {
    return metadataKeys.map((key) => ResourceTableColumns.metadata(key));
  }, [metadataKeys]);

  const columns = useMemo(
    () =>
      [
        {
          ...Table.Columns.name(),
          enableHiding: false,
        },
        Table.Columns.description(),
        Table.Columns.externalId(),
        Table.Columns.rootAsset(false, onRowClick),
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
        ...metadataColumns,
      ] as ColumnDef<AssetWithRelationshipLabels>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns, query]
  );

  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  return (
    <Table<InternalAssetDataWithMatchingLabels>
      data={data || []}
      columns={columns}
      onRowClick={onRowClick}
      hiddenColumns={hiddenColumns}
      renderRowSubComponent={SubRowMatchingLabel}
      {...rest}
    />
  );
};
