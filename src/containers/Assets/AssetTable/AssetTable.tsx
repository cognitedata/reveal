import { ColumnDef } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { Asset } from '@cognite/sdk';

import { Table, TableProps } from 'components/Table/Table';
import { RelationshipLabels } from 'types';

export type AssetWithRelationshipLabels = RelationshipLabels & Asset;

import { useGetHiddenColumns } from 'hooks';
import { ResourceTableColumns } from '../../../components';
import { useAssetsMetadataKeys } from '../../../domain';
import { ThreeDModelCell } from './ThreeDModelCell';
import { RootAsset } from 'components/RootAsset';

const visibleColumns = ['name', 'rootId'];

export const AssetTable = ({
  onRowClick = () => {},
  data,
  query,
  ...rest
}: Omit<TableProps<AssetWithRelationshipLabels>, 'columns'>) => {
  const { data: metadataKeys } = useAssetsMetadataKeys();

  const metadataColumns: ColumnDef<AssetWithRelationshipLabels>[] =
    useMemo(() => {
      return (metadataKeys || []).map((key: string) =>
        ResourceTableColumns.metadata(key)
      );
    }, [metadataKeys]);

  const columns = useMemo(
    () =>
      [
        {
          ...Table.Columns.name(query),
          enableHiding: false,
        },
        Table.Columns.description(query),
        Table.Columns.externalId(query),
        {
          ...Table.Columns.rootAsset,
          cell: ({ getValue }) => (
            <RootAsset
              externalLink={false}
              assetId={getValue<number>()}
              onClick={onRowClick}
            />
          ),
          enableSorting: false,
        },
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
        ...metadataColumns,
      ] as ColumnDef<AssetWithRelationshipLabels>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns, query]
  );

  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  return (
    <Table<Asset>
      data={data || []}
      columns={columns}
      onRowClick={onRowClick}
      hiddenColumns={hiddenColumns}
      {...rest}
    />
  );
};
