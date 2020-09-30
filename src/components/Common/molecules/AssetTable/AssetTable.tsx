import React, { useState } from 'react';
import { Asset } from 'cognite-sdk-v3';
import { Column } from 'react-base-table';
import { Button } from '@cognite/cogs.js';

import { useSelectionCheckbox } from 'hooks/useSelection';
import {
  useResourceMode,
  useResourcesState,
} from 'context/ResourceSelectionContext';
import { Table } from 'components/Common';
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
  assets: Asset[];
  query?: string;
  onAssetClicked: (asset: Asset) => void;
};

export const AssetTable = ({
  assets,
  query,
  onAssetClicked,
}: AssetTableProps) => {
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);
  const { mode } = useResourceMode();
  const { resourcesState } = useResourcesState();

  const currentItems = resourcesState.filter(el => el.state === 'active');

  const onAssetSelected = (asset: Asset) => {
    onAssetClicked(asset);
    setPreviewId(asset.id);
  };

  return (
    <Table<Asset>
      query={query}
      rowEventHandlers={{
        onClick: ({ rowData: asset, event }) => {
          onAssetSelected(asset);
          return event;
        },
      }}
      previewingIds={previewId ? [previewId] : []}
      activeIds={currentItems.map(el => el.id)}
      columns={[
        {
          key: 'name',
          title: 'Name',
          dataKey: 'name',
          width: 300,
          frozen: Column.FrozenDirection.LEFT,
        },
        {
          key: 'description',
          title: 'Description',
          dataKey: 'description',
          width: 300,
        },
        {
          key: 'root',
          title: 'Root asset',
          width: 200,
          cellRenderer: ({ rowData: asset }: { rowData: Asset }) => {
            return (
              <ParentCell
                rootId={asset.rootId}
                onAssetSelected={onAssetSelected}
              />
            );
          },
        },
        ...(mode !== 'none'
          ? [
              {
                key: 'action',
                title: 'Select',
                width: 80,
                align: Column.Alignment.CENTER,
                frozen: Column.FrozenDirection.RIGHT,
                cellRenderer: ({ rowData: asset }: { rowData: Asset }) => {
                  return <ActionCell asset={asset} />;
                },
              },
            ]
          : []),
      ]}
      fixed
      data={assets}
    />
  );
};
