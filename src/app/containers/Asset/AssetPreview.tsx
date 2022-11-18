import React, { useEffect, useContext } from 'react';
import { trackUsage } from 'app/utils/Metrics';
import { useParams } from 'react-router-dom';

import {
  AssetDetails,
  AssetTreeTable,
  Loader,
  ErrorFeedback,
  Metadata,
  ResourceItem,
} from '@cognite/data-exploration';
import { Tabs } from '@cognite/cogs.js';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Asset } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';
import { useCurrentResourceId, useOnPreviewTabChange } from 'app/hooks/hooks';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';
import { DetailsTabWrapper } from 'app/containers/Common/element';
import { Breadcrumbs } from 'app/components/Breadcrumbs/Breadcrumbs';
import { ResourceTabType } from 'app/containers/ThreeD/NodePreview';

export type AssetPreviewTabType =
  | 'details'
  | 'assets'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events'
  | 'children';

export const AssetPreview = ({
  assetId,
  actions,
  hideDefaultCloseActions,
  tab = 'details',
}: {
  assetId: number;
  actions?: React.ReactNode;
  hideDefaultCloseActions?: boolean;
  tab?: ResourceTabType;
}) => {
  const { tabType } = useParams<{
    tabType: ResourceTabType;
  }>();
  const activeTab = tabType || tab || 'details';

  const onTabChange = useOnPreviewTabChange(tabType, 'details');

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
      <Breadcrumbs currentResource={{ title: asset.name }} />
      <ResourceTitleRow
        item={{ id: assetId, type: 'asset' }}
        afterDefaultActions={actions}
        hideDefaultCloseActions={hideDefaultCloseActions}
      />
      <ResourceDetailsTabs
        parentResource={{
          type: 'asset',
          id: asset.id,
          externalId: asset.externalId,
          title: asset.name,
        }}
        tab={activeTab}
        onTabChange={onTabChange}
        additionalTabs={[
          <Tabs.TabPane tab={<TabTitle>Details</TabTitle>} key="details">
            <DetailsTabWrapper>
              <AssetDetails asset={asset} />
              <Metadata metadata={asset.metadata} />
            </DetailsTabWrapper>
          </Tabs.TabPane>,
          <Tabs.TabPane tab={<TabTitle>Hierarchy</TabTitle>} key="children">
            <AssetTreeTable
              activeIds={[asset.id]}
              filter={
                asset.id === asset.rootId
                  ? { assetSubtreeIds: [{ value: asset.rootId }] }
                  : {}
              }
              hierachyRootId={asset.rootId}
              onAssetClicked={(newAsset: Asset) => openAsset(newAsset.id)}
              selectionMode={mode}
              onSelect={onSelect}
              isSelected={isSelected}
            />
          </Tabs.TabPane>,
        ]}
      />
    </>
  );
};
