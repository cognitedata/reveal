import * as React from 'react';
import { createLink } from '@cognite/cdf-utilities';
import {
  AssetDetailsTreeTable,
  ResourceTypes,
} from '@cognite/data-exploration';
import { useNavigateWithHistory } from '@data-exploration-app/hooks/hooks';
import { Asset } from '@cognite/sdk';
import qs from 'query-string';
import { useLocation } from 'react-router-dom';
import ResourceSelectionContext from '@data-exploration-app/context/ResourceSelectionContext';
import { isResourceSelected } from '@data-exploration-app/utils/compare';

export const AssetHierarchyTab = ({ asset }: { asset: Asset }) => {
  const navigateWithHistory = useNavigateWithHistory({
    type: ResourceTypes.Asset,
    id: asset.id,
    externalId: asset.externalId,
    title: asset.name,
  });
  const location = useLocation();
  const { mode, onSelect, resourcesState } = React.useContext(
    ResourceSelectionContext
  );

  return (
    <AssetDetailsTreeTable
      assetId={asset.id}
      rootAssetId={asset.rootId}
      activeIds={[asset.id]}
      onAssetClicked={(newAsset: Asset) => {
        navigateWithHistory(
          createLink(`/explore/asset/${newAsset.id}`, qs.parse(location.search))
        );
      }}
      selectionMode={mode}
      onSelect={onSelect}
      isSelected={(item) => isResourceSelected(item, resourcesState)}
      selectedRows={{ [asset.id]: true }}
    />
  );
};
