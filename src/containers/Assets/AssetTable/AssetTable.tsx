import React from 'react';
import { Asset } from '@cognite/sdk';
import { Button } from '@cognite/cogs.js';
import { TableProps, Table } from 'components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

const ParentCell = ({
  rootId,
  onRowClick,
}: {
  rootId: number;
  onRowClick: (asset: Asset) => void;
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
          onRowClick(rootAsset);
        }
      }}
    >
      {isFetched ? rootAsset?.name : 'Loading...'}
    </Button>
  );
};

export type AssetTableProps = TableProps<Asset>;

export const AssetTable = (props: AssetTableProps) => {
  const { onRowClick = () => {} } = props;
  const columns = [
    Table.Columns.name,
    Table.Columns.description,
    Table.Columns.externalId,
    Table.Columns.relationships,
    {
      ...Table.Columns.root,
      cellRenderer: ({ rowData: asset }: { rowData: Asset }) => (
        <ParentCell rootId={asset.rootId} onRowClick={onRowClick} />
      ),
    },
  ];

  return <Table<Asset> columns={columns} {...props} />;
};
