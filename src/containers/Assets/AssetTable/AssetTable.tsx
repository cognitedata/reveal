import { ColumnDef } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { Asset } from '@cognite/sdk';

import { Table, TableProps } from 'components/Table/Table';
import { RelationshipLabels } from 'types';

export type AssetWithRelationshipLabels = RelationshipLabels & Asset;

import { useGetHiddenColumns } from 'hooks';
import { ThreeDModelCell } from './ThreeDModelCell';
import { RootAsset } from 'components/RootAsset';

const visibleColumns = ['name', 'rootId'];

export const AssetTable = (
  props: Omit<TableProps<AssetWithRelationshipLabels>, 'columns'>
) => {
  const { onRowClick = () => {}, data, ...rest } = props;

  const columns = useMemo(
    () => [
      {
        ...Table.Columns.name,
        enableHiding: false,
      },
      Table.Columns.description,
      Table.Columns.externalId,
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
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ) as ColumnDef<AssetWithRelationshipLabels>[];

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
