import { ColumnDef } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { Asset } from '@cognite/sdk';

import {
  Table,
  TableProps,
} from '@data-exploration-components/components/Table/Table';
import { RelationshipLabels } from '@data-exploration-components/types';

import { useGetHiddenColumns } from '@data-exploration-components/hooks';
import { ResourceTableColumns } from '../../../components';
import { useAssetsMetadataKeys } from '@data-exploration-lib/domain-layer';
import { ThreeDModelCell } from './ThreeDModelCell';
import noop from 'lodash/noop';

export type AssetWithRelationshipLabels = RelationshipLabels & Asset;

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
          ...Table.Columns.name(query),
          enableHiding: false,
        },
        Table.Columns.description(query),
        Table.Columns.externalId(query),
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
        Table.Columns.source(query),
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
