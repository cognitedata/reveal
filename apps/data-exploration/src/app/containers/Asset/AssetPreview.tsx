import React, { useEffect, useContext } from 'react';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { useParams } from 'react-router-dom';

import {
  AssetDetails,
  AssetDetailsTreeTable,
  Loader,
  ErrorFeedback,
  Metadata,
  ResourceItem,
} from '@cognite/data-exploration';
import { Tabs } from '@cognite/cogs.js';
import ResourceTitleRow from '@data-exploration-app/components/ResourceTitleRow';
import { Asset, CogniteError } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import {
  ResourceDetailsTabs,
  TabTitle,
} from '@data-exploration-app/containers/ResourceDetails';
import {
  useCurrentResourceId,
  useOnPreviewTabChange,
} from '@data-exploration-app/hooks/hooks';
import ResourceSelectionContext from '@data-exploration-app/context/ResourceSelectionContext';
import { DetailsTabWrapper } from '@data-exploration-app/containers/Common/element';
import { Breadcrumbs } from '@data-exploration-app/components/Breadcrumbs/Breadcrumbs';
import { ResourceTabType } from '@data-exploration-app/containers/ThreeD/NodePreview';

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
  const [, openPreview] = useCurrentResourceId();

  const handlePreviewClose = () => {
    openPreview(undefined);
  };

  useEffect(() => {
    trackUsage('Exploration.Preview.Asset', { assetId });
  }, [assetId]);

  const { mode, onSelect, resourcesState } = useContext(
    ResourceSelectionContext
  );

  const isSelected = (item: ResourceItem) => {
    return resourcesState.some(
      (el) =>
        // eslint-disable-next-line lodash/prefer-matches
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
    const { errorMessage: message, status, requestId } = error as CogniteError;
    return (
      <ErrorFeedback
        error={{ message, status, requestId }}
        onPreviewClose={handlePreviewClose}
      />
    );
  }

  if (!asset) {
    return <>Asset {assetId} not found!</>;
  }

  return (
    <>
      <Breadcrumbs currentResource={{ title: asset.name }} />
      <ResourceTitleRow
        item={{ id: assetId, type: 'asset' }}
        title={asset.name}
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
            <AssetDetailsTreeTable
              assetId={assetId}
              rootAssetId={asset.rootId}
              activeIds={[asset.id]}
              onAssetClicked={(newAsset: Asset) => {
                openAsset(newAsset.id, undefined, 'asset');
              }}
              selectionMode={mode}
              onSelect={onSelect}
              isSelected={isSelected}
              selectedRows={{ [assetId]: true }}
            />
          </Tabs.TabPane>,
        ]}
      />
    </>
  );
};
