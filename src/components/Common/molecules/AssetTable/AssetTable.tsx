import React from 'react';
import { Asset } from '@cognite/sdk';
import { Button } from '@cognite/cogs.js';
import { useSelectionCheckbox } from 'hooks/useSelection';
import { useResourceMode } from 'context/ResourceSelectionContext';
import { TableProps, Table } from 'components/Common';
import { useCdfItem } from 'hooks/sdk';

const ActionCell = ({ asset }: { asset: Asset }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: asset.id, type: 'asset' });
};

const ParentCell = ({
  rootId,
  onItemClicked,
}: {
  rootId: number;
  onItemClicked: (asset: Asset) => void;
}) => {
  const { data: rootAsset, isFetched } = useCdfItem<Asset>(
    'assets',
    { id: rootId },
    {
      enabled: !!rootId,
    }
  );

  return (
    <Button
      type="link"
      icon="ArrowRight"
      iconPlacement="right"
      style={{ color: 'inherit' }}
      onClick={e => {
        e.stopPropagation();
        if (rootAsset) {
          onItemClicked(rootAsset);
        }
      }}
    >
      {isFetched ? rootAsset?.name : 'Loading...'}
    </Button>
  );
};

export type AssetTableProps = {
  items: Asset[];
  onItemClicked: (asset: Asset) => void;
} & TableProps<Asset>;

export const AssetTable = ({
  items,
  onItemClicked,
  ...props
}: AssetTableProps) => {
  const { mode } = useResourceMode();

  const columns = [
    Table.Columns.name,
    Table.Columns.externalId,
    Table.Columns.description,
    {
      ...Table.Columns.root,
      cellRenderer: ({ rowData: asset }: { rowData: Asset }) => {
        return (
          <ParentCell rootId={asset.rootId} onItemClicked={onItemClicked} />
        );
      },
    },
    ...(mode !== 'none'
      ? [
          {
            ...Table.Columns.select,
            cellRenderer: ({ rowData: asset }: { rowData: Asset }) => {
              return <ActionCell asset={asset} />;
            },
          },
        ]
      : []),
  ];

  return (
    <Table<Asset>
      data={items}
      columns={columns}
      onRowClick={onItemClicked}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};
