import React from 'react';
import { Asset } from '@cognite/sdk';
import { Button } from '@cognite/cogs.js';

import { useSelectionCheckbox } from 'hooks/useSelection';
import { useResourceMode } from 'context/ResourceSelectionContext';
import { ResourceTable, ResourceTableColumns } from 'components/Common';
import { useCdfItem } from 'hooks/sdk';

const ActionCell = ({ asset }: { asset: Asset }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: asset.id, type: 'asset' });
};

const ParentCell = ({
  rootId,
  onAssetSelected,
}: {
  rootId: number;
  onAssetSelected: (asset: Asset) => void;
}) => {
  const { data: rootAsset, isFetched } = useCdfItem<Asset>('assets', rootId, {
    enabled: !!rootId,
  });

  return (
    <Button
      type="link"
      icon="ArrowRight"
      iconPlacement="right"
      style={{ color: 'inherit' }}
      onClick={e => {
        e.stopPropagation();
        if (rootAsset) {
          onAssetSelected(rootAsset);
        }
      }}
    >
      {isFetched ? rootAsset?.name : 'Loading...'}
    </Button>
  );
};

export type AssetTableProps = {
  filter?: any;
  query?: string;
  onAssetClicked: (asset: Asset) => void;
};

export const AssetTable = ({
  filter,
  query,
  onAssetClicked,
}: AssetTableProps) => {
  const { mode } = useResourceMode();

  const columns = [
    ResourceTableColumns.name,
    ResourceTableColumns.description,
    {
      ...ResourceTableColumns.root,
      cellRenderer: ({ rowData: asset }: { rowData: Asset }) => {
        return (
          <ParentCell rootId={asset.rootId} onAssetSelected={onAssetClicked} />
        );
      },
    },
    ...(mode !== 'none'
      ? [
          {
            ...ResourceTableColumns.select,
            cellRenderer: ({ rowData: asset }: { rowData: Asset }) => {
              return <ActionCell asset={asset} />;
            },
          },
        ]
      : []),
  ];

  return (
    <ResourceTable<Asset>
      api="assets"
      query={query}
      filter={filter}
      columns={columns}
      onRowClick={onAssetClicked}
    />
  );
};
