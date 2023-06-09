import React, { useEffect } from 'react';

import { Loader, Metadata } from '@data-exploration/components';
import { AssetInfo } from '@data-exploration/containers';

import { Tabs } from '@cognite/cogs.js';
import { ErrorFeedback, ResourceTypes } from '@cognite/data-exploration';
import { Asset, CogniteError } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { BreadcrumbsV2 } from '@data-exploration-app/components/Breadcrumbs/BreadcrumbsV2';
import ResourceTitleRowV2 from '@data-exploration-app/components/ResourceTitleRowV2';
import { DetailsTabWrapper } from '@data-exploration-app/containers/Common/element';
import { ResourceDetailsTabsV2 } from '@data-exploration-app/containers/ResourceDetails';
import {
  useEndJourney,
  usePushJourney,
  useResourceDetailSelectedTab,
} from '@data-exploration-app/hooks';
import { trackUsage } from '@data-exploration-app/utils/Metrics';

import { AssetHierarchyTab } from './AssetHierarchyTab';

// Asset details tabs;
// - details
// - children
// - assets
// - timeseries
// - files
// - sequences
// - events

export const AssetDetail = ({
  assetId,
  actions,
  hideDefaultCloseActions,
}: {
  assetId: number;
  actions?: React.ReactNode;
  hideDefaultCloseActions?: boolean;
}) => {
  const [selectedTab, setSelectedTab] = useResourceDetailSelectedTab();
  const [pushJourney] = usePushJourney();
  const [endJourney] = useEndJourney();

  const activeTab = selectedTab ?? 'details';

  const handlePreviewClose = () => {
    endJourney();
  };

  const handleTabChange = (newTab: string) => {
    setSelectedTab(newTab);
  };

  const handleRootAssetClick = (rootAssetId: number) => {
    pushJourney({ id: rootAssetId, type: 'asset' });
  };

  useEffect(() => {
    trackUsage('Exploration.Preview.Asset', { assetId });
  }, [assetId]);

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
      <BreadcrumbsV2 />

      <ResourceTitleRowV2
        item={{ id: assetId, type: ResourceTypes.Asset }}
        title={asset.name}
        afterDefaultActions={actions}
        hideDefaultCloseActions={hideDefaultCloseActions}
      />

      <ResourceDetailsTabsV2
        parentResource={{
          type: ResourceTypes.Asset,
          id: asset.id,
          externalId: asset.externalId,
          title: asset.name,
        }}
        onTabChange={handleTabChange}
        tab={activeTab}
        additionalTabs={[
          <Tabs.Tab label="Details" key="details" tabKey="details">
            <DetailsTabWrapper>
              <AssetInfo
                asset={asset}
                onClickRootAsset={handleRootAssetClick}
              />
              <Metadata metadata={asset.metadata} />
            </DetailsTabWrapper>
          </Tabs.Tab>,
          <Tabs.Tab label="Hierarchy" key="children" tabKey="children">
            <AssetHierarchyTab asset={asset} />
          </Tabs.Tab>,
        ]}
      />
    </>
  );
};
