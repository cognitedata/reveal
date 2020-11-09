import React from 'react';
import { Asset } from '@cognite/sdk';
import { Button } from '@cognite/cogs.js';
import { TableProps, Table } from 'lib';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

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
  const columns = [
    Table.Columns.name,
    Table.Columns.externalId,
    Table.Columns.description,
    Table.Columns.relationships,
    {
      ...Table.Columns.root,
      cellRenderer: ({ rowData: asset }: { rowData: Asset }) => {
        return (
          <ParentCell rootId={asset.rootId} onItemClicked={onItemClicked} />
        );
      },
    },
  ];

  return (
    <Table<Asset>
      data={items}
      columns={columns}
      onRowClick={onItemClicked}
      {...props}
    />
  );
};
