import { ColumnDef } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { Asset } from '@cognite/sdk';
import { Button } from '@cognite/cogs.js';
import { TableV2 as Table, TableProps } from 'components/ReactTable/V2/TableV2';
import { RelationshipLabels } from 'types';

export type AssetWithRelationshipLabels = RelationshipLabels & Asset;

import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { StyledButton } from 'components/ReactTable';
import { useThreeDAssetMappings } from 'hooks/threeDHooks';
import { useGetHiddenColumns } from 'hooks';
import { ThreeDModelCell } from './ThreeDModelCell';

const visibleColumns = ['name', 'rootId'];

export const ParentCell = ({
  rootId,
  onClick,
}: {
  rootId: number;
  onClick: (asset: Asset) => void;
}) => {
  const { data: rootAsset, isLoading } = useCdfItem<Asset>(
    'assets',
    { id: rootId },
    {
      enabled: Boolean(rootId),
    }
  );

  return (
    <Button
      type="link"
      iconPlacement="right"
      icon="ArrowRight"
      onClick={e => {
        e.stopPropagation();
        if (rootAsset) {
          onClick(rootAsset);
        }
      }}
    >
      {isLoading ? (
        'Loading...'
      ) : (
        <StyledButton>{rootAsset?.name}</StyledButton>
      )}
    </Button>
  );
};

export const AssetNewTable = (
  props: Omit<TableProps<AssetWithRelationshipLabels>, 'columns'>
) => {
  const { onRowClick = () => {}, data, ...rest } = props;

  const { data: threeDAssetMappings } = useThreeDAssetMappings();

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
          <ParentCell
            rootId={getValue<number>()!}
            onClick={onRowClick as any}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'id',
        header: '3D availability',
        cell: ({ getValue }) => (
          <ThreeDModelCell
            assetId={getValue<number>()}
            mappings={threeDAssetMappings[getValue<number>()]}
          />
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
    [threeDAssetMappings]
  ) as ColumnDef<AssetWithRelationshipLabels>[];

  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  return (
    <Table<Asset>
      data={data || []}
      columns={columns}
      onRowClick={onRowClick}
      {...rest}
      hiddenColumns={hiddenColumns}
    />
  );
};
