import * as React from 'react';

import { AssetDetailsTreeTable } from '@cognite/data-exploration';
import { Asset } from '@cognite/sdk';

import { usePushJourney } from '../../hooks';

export const AssetHierarchyTab = ({ asset }: { asset: Asset }) => {
  const [pushJourney] = usePushJourney();

  const handlePushJourney = (assetId: number) => {
    pushJourney({ id: assetId, type: 'asset' });
  };

  return (
    <AssetDetailsTreeTable
      assetId={asset.id}
      rootAssetId={asset.rootId}
      activeIds={[asset.id]}
      onAssetClicked={(newAsset: Asset) => {
        handlePushJourney(newAsset.id);
      }}
      selectedRows={{ [asset.id]: true }}
      scrollIntoViewRow={asset.id}
    />
  );
};
