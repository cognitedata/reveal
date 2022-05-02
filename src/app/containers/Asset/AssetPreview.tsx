import React, { useEffect, useContext } from 'react';
import { trackUsage } from 'app/utils/Metrics';
import { useParams } from 'react-router-dom';

import {
  AssetDetails,
  AssetTreeTable,
  Loader,
  ErrorFeedback,
  Tabs,
  Metadata,
  ResourceItem,
} from '@cognite/data-exploration';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Asset } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';
import { useCurrentResourceId, useOnPreviewTabChange } from 'app/hooks';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';

export type AssetPreviewTabType =
  | 'details'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events'
  | 'children';

export const AssetPreview = ({
  assetId,
  actions,
}: {
  assetId: number;
  actions?: React.ReactNode;
}) => {
  const { tabType } = useParams<{
    tabType: AssetPreviewTabType;
  }>();
  const activeTab = tabType || 'details';

  const onTabChange = useOnPreviewTabChange(tabType, 'asset');

  useEffect(() => {
    trackUsage('Exploration.Preview.Asset', { assetId });
  }, [assetId]);

  const { mode, onSelect, resourcesState } = useContext(
    ResourceSelectionContext
  );

  const isSelected = (item: ResourceItem) => {
    return resourcesState.some(
      el =>
        el.state === 'selected' && el.id === item.id && el.type === item.type
    );
  };

  const openAsset = useCurrentResourceId()[1];

  const {
    data: asset,
    isFetched,
    error,
  } = useCdfItem<Asset>(
    'assets',
    { id: assetId },
    {
      enabled: !!assetId,
    }
  );

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!asset) {
    return <>Asset {assetId} not found!</>;
  }

  return (
    <>
      <ResourceTitleRow
        item={{ id: assetId, type: 'asset' }}
        afterDefaultActions={actions}
      />
      <ResourceDetailsTabs
        parentResource={{
          type: 'asset',
          id: asset.id,
          externalId: asset.externalId,
        }}
        tab={activeTab}
        onTabChange={onTabChange}
        additionalTabs={[
          <Tabs.Pane title={<TabTitle>Details</TabTitle>} key="details">
            <AssetDetails asset={asset} />
            <Metadata metadata={asset.metadata} />
          </Tabs.Pane>,
          <Tabs.Pane
            title={<TabTitle>Children</TabTitle>}
            style={{ padding: '20px 16px' }}
            key="children"
          >
            <AssetTreeTable
              filter={{ parentIds: [asset.id] }}
              onAssetClicked={(newAsset: Asset) => openAsset(newAsset.id)}
              selectionMode={mode}
              onSelect={onSelect}
              isSelected={isSelected}
            />
          </Tabs.Pane>,
        ]}
      />
    </>
  );
};
