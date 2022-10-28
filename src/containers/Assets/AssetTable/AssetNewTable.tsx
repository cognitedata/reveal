import { ColumnDef } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { Asset } from '@cognite/sdk';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { TableV2 as Table, TableProps } from 'components/ReactTable/V2/TableV2';
import { RelationshipLabels, ThreeDModelClickHandler } from 'types';

export type AssetWithRelationshipLabels = RelationshipLabels & Asset;

import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { StyledButton } from 'components/ReactTable';
import {
  ThreeDAssetMappingItem,
  useThreeDAssetMappings,
} from 'hooks/threeDHooks';

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

export const ThreeDModelCell = ({
  assetId,
  mappings,
  onThreeDModelClick,
}: {
  assetId: number;
  mappings: ThreeDAssetMappingItem[];
  onThreeDModelClick?: ThreeDModelClickHandler;
}) => {
  if (!mappings?.length) {
    return null;
  }

  if (mappings.length === 1) {
    const mapping = mappings[0];
    return (
      <Button
        icon="ArrowUpRight"
        iconPlacement="right"
        onClick={e => {
          e.stopPropagation();
          onThreeDModelClick?.(mapping, assetId, e);
        }}
        type="ghost"
      >
        {mapping.model.name}
      </Button>
    );
  }

  return (
    <Dropdown
      content={
        <Menu onClick={e => e.stopPropagation()}>
          <Menu.Header>Models</Menu.Header>
          {mappings.map(mapping => (
            <Menu.Item
              appendIcon="ArrowUpRight"
              key={mapping.model.id}
              onClick={e => {
                onThreeDModelClick?.(mapping, assetId, e);
              }}
            >
              {mapping.model.name}
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      <Button
        icon="ChevronDown"
        iconPlacement="right"
        onClick={e => e.stopPropagation()}
        type="ghost"
      >
        {mappings.length} models available
      </Button>
    </Dropdown>
  );
};

export const AssetNewTable = (
  props: Omit<TableProps<AssetWithRelationshipLabels>, 'columns'> & {
    onThreeDModelClick?: ThreeDModelClickHandler;
  }
) => {
  const { onRowClick = () => {}, data, onThreeDModelClick, ...rest } = props;

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
        Cell: ({ value }: { value: number }) => (
          <ParentCell rootId={value!} onClick={onRowClick as any} />
        ),
      },
      {
        accessorKey: 'id',
        header: '3D availability',
        cell: ({ getValue }) => (
          <ThreeDModelCell
            assetId={getValue<number>()}
            mappings={threeDAssetMappings[getValue<number>()]}
            onThreeDModelClick={onThreeDModelClick}
          />
        ),
        size: 300,
      },
      Table.Columns.created,
      Table.Columns.labels,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [threeDAssetMappings]
  ) as ColumnDef<AssetWithRelationshipLabels>[];

  const hiddenColumns = useMemo(() => {
    return (
      columns
        .filter(
          column =>
            // @ts-ignore Don't know why `accessorKey` is not recognized from the type -_-
            !visibleColumns.includes(column.accessorKey || column?.id)
        )
        // @ts-ignore
        .map(column => column.accessorKey || column.id)
    );
  }, [columns]);

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
