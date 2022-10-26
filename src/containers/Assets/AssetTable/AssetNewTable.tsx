import React, { useMemo } from 'react';
import { Asset } from '@cognite/sdk';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { Column } from 'react-table';
import { NewTable as Table, TableProps } from 'components/ReactTable/Table';
import { RelationshipLabels, ThreeDModelClickHandler } from 'types';

export type AssetWithRelationshipLabels = RelationshipLabels & Asset;

import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { StyledButton } from 'components/ReactTable';
import {
  ThreeDAssetMappingItem,
  useThreeDAssetMappings,
} from 'hooks/threeDHooks';

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
  mappings,
  onThreeDModelClick,
}: {
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
          onThreeDModelClick?.(mapping, e);
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
                onThreeDModelClick?.(mapping, e);
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
  props: TableProps<AssetWithRelationshipLabels> & {
    onThreeDModelClick?: (
      mapping: ThreeDAssetMappingItem,
      e: React.MouseEvent
    ) => void;
  }
) => {
  const { onRowClick = () => {}, data, onThreeDModelClick, ...rest } = props;

  const { data: threeDAssetMappings } = useThreeDAssetMappings();

  const columns = useMemo(
    () => [
      Table.Columns.name,
      Table.Columns.description,
      Table.Columns.externalId,
      {
        ...Table.Columns.rootAsset,
        Cell: ({ value }: { value: number }) => (
          <ParentCell rootId={value!} onClick={onRowClick as any} />
        ),
      },
      {
        accessor: 'id',
        Header: '3D availability',
        Cell: ({ value }) => (
          <ThreeDModelCell
            mappings={threeDAssetMappings[value]}
            onThreeDModelClick={onThreeDModelClick}
          />
        ),
        width: 300,
      } as Column<Asset>,
      Table.Columns.created,
      Table.Columns.labels,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [threeDAssetMappings]
  ) as Column<Asset>[];

  return (
    <Table<Asset>
      columns={columns}
      visibleColumns={['name', 'rootId']}
      data={data || []}
      onRowClick={onRowClick}
      {...rest}
    />
  );
};
