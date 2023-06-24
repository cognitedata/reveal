import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Loader, Metadata } from '@data-exploration/components';
import { AssetInfo } from '@data-exploration/containers';

import { createLink } from '@cognite/cdf-utilities';
import { Tabs } from '@cognite/cogs.js';
import { ErrorFeedback, ResourceTypes } from '@cognite/data-exploration';
import { Asset, CogniteError } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { Breadcrumbs } from '@data-exploration-app/components/Breadcrumbs/Breadcrumbs';
import ResourceTitleRow from '@data-exploration-app/components/ResourceTitleRow';
import { DetailsTabWrapper } from '@data-exploration-app/containers/Common/element';
import { ResourceDetailsTabs } from '@data-exploration-app/containers/ResourceDetails';
import { ResourceTabType } from '@data-exploration-app/containers/ThreeD/NodePreview';
import {
  useCurrentResourceId,
  useOnPreviewTabChange,
} from '@data-exploration-app/hooks/hooks';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { getSearchParams } from '@data-exploration-app/utils/URLUtils';
import { useTranslation } from '@data-exploration-lib/core';

import { AssetHierarchyTab } from './AssetHierarchyTab';

export type AssetPreviewTabType =
  | 'details'
  | 'assets'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events'
  | 'children';

// TODO: rename this to AssetDetail or sth. else!
export const AssetPreview = ({
  assetId,
  actions,
  hideDefaultCloseActions,
  tab,
}: {
  assetId: number;
  actions?: React.ReactNode;
  hideDefaultCloseActions?: boolean;
  tab?: ResourceTabType;
}) => {
  const { t } = useTranslation();

  const { tabType } = useParams<{
    tabType: ResourceTabType;
  }>();

  const activeTab = tabType || tab || 'details';

  // HERE
  const onTabChange = useOnPreviewTabChange(tabType, 'details');
  const [, openPreview] = useCurrentResourceId();

  // HERE
  const handlePreviewClose = () => {
    openPreview(undefined);
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

  const navigate = useNavigate();
  const location = useLocation();

  // TODO(DEGR-2521): refactor this
  const onClickHandler = (rootAssetId: number) => {
    const search = getSearchParams(location.search);
    navigate(createLink(`/explore/search/asset/${rootAssetId}`, search));
  };

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
    <>
      <Breadcrumbs currentResource={{ title: asset.name }} />
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
        onTabChange={onTabChange}
        tab={activeTab}
        additionalTabs={[
          <Tabs.Tab
            label={t('DETAILS', 'Details')}
            key="details"
            tabKey="details"
          >
            <DetailsTabWrapper>
              <AssetInfo asset={asset} onClickRootAsset={onClickHandler} />
              <Metadata metadata={asset.metadata} />
            </DetailsTabWrapper>
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
    </>
  );
};
