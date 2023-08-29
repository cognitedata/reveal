import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Loader, Metadata } from '@data-exploration/components';
import { AssetInfo } from '@data-exploration/containers';

import { useCdfUserHistoryService } from '@cognite/cdf-utilities';
import { Tabs } from '@cognite/cogs.js';
import { ErrorFeedback, ResourceTypes } from '@cognite/data-exploration';
import { Asset, CogniteError } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { BreadcrumbsV2 } from '@data-exploration-app/components/Breadcrumbs/BreadcrumbsV2';
import ResourceTitleRow from '@data-exploration-app/components/ResourceTitleRow';
import { DetailsTabWrapper } from '@data-exploration-app/containers/Common/element';
import { ResourceDetailsTabs } from '@data-exploration-app/containers/ResourceDetails';
import {
  useEndJourney,
  usePushJourney,
  useResourceDetailSelectedTab,
} from '@data-exploration-app/hooks';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import {
  useTranslation,
  SUB_APP_PATH,
  createInternalLink,
} from '@data-exploration-lib/core';

import { AllTab } from '../All';

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
  const { t } = useTranslation();

  const [selectedTab, setSelectedTab] = useResourceDetailSelectedTab();
  const [pushJourney] = usePushJourney();
  const [endJourney] = useEndJourney();

  const activeTab = selectedTab ?? 'details';

  const { pathname, search: searchParams } = useLocation();
  const userHistoryService = useCdfUserHistoryService();

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
    isFetched: isAssetFetched,
    error,
  } = useCdfItem<Asset>(
    'assets',
    { id: assetId },
    {
      enabled: !!assetId,
    }
  );

  useEffect(() => {
    if (isAssetFetched && asset) {
      // save Asset preview as view resource in user history
      if (asset?.name)
        userHistoryService.logNewResourceView({
          application: SUB_APP_PATH,
          name: asset?.name,
          path: createInternalLink(pathname, searchParams),
        });
    }
  }, [isAssetFetched, asset]);

  if (!isAssetFetched) {
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
    return (
      <>
        {t('RESOURCE_NOT_FOUND', `Asset ${assetId} not found!`, {
          resourceType: t('ASSET', 'Asset'),
          id: assetId,
        })}
      </>
    );
  }

  return (
    <div data-testid="asset-detail">
      <BreadcrumbsV2 />

      <ResourceTitleRow
        item={{ id: assetId, type: ResourceTypes.Asset }}
        title={asset.name}
        afterDefaultActions={actions}
        hideDefaultCloseActions={hideDefaultCloseActions}
      />

      <ResourceDetailsTabs
        parentResource={{
          type: ResourceTypes.Asset,
          id: asset.id,
          externalId: asset.externalId,
          title: asset.name,
        }}
        onTabChange={handleTabChange}
        tab={activeTab}
        additionalTabs={[
          <Tabs.Tab
            label={t('DETAILS', 'Details')}
            key="details"
            tabKey="details"
          >
            <DetailsTabWrapper>
              <AssetInfo
                asset={asset}
                onClickRootAsset={handleRootAssetClick}
              />
              <Metadata metadata={asset.metadata} />
            </DetailsTabWrapper>
          </Tabs.Tab>,
          <Tabs.Tab
            label={t('ALL_RESOURCES', 'All resources')}
            key="all-resources"
            tabKey="all-resources"
          >
            <AllTab
              filters={{ common: { assetSubtreeIds: [{ value: asset.id }] } }}
              setCurrentResourceType={(type) => type && setSelectedTab(type)}
              selectedResourceExternalId={asset.externalId}
            />
          </Tabs.Tab>,
          <Tabs.Tab
            label={t('HIERARCHY_TAB_LABEL', 'Hierarchy')}
            key="children"
            tabKey="children"
          >
            <AssetHierarchyTab asset={asset} />
          </Tabs.Tab>,
        ]}
      />
    </div>
  );
};
