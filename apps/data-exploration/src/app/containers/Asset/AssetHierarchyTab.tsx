import * as React from 'react';

import { AssetDetailsTreeTable } from '@cognite/data-exploration';
import { Asset } from '@cognite/sdk';

import ResourceSelectionContext from '@data-exploration-app/context/ResourceSelectionContext';
import { isResourceSelected } from '@data-exploration-app/utils/compare';

import { usePushJourney } from '../../hooks/detailsNavigation';

export const AssetHierarchyTab = ({ asset }: { asset: Asset }) => {
  const [pushJourney] = usePushJourney();

  const { mode, onSelect, resourcesState } = React.useContext(
    ResourceSelectionContext
  );

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
      selectionMode={mode}
      onSelect={onSelect}
      isSelected={(item) => isResourceSelected(item, resourcesState)}
      selectedRows={{ [asset.id]: true }}
      scrollIntoViewRow={asset.id}
    />
  );
};
