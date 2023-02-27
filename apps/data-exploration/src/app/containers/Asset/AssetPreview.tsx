import React, { useEffect } from 'react';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { useParams } from 'react-router-dom';

import {
  AssetDetails,
  Loader,
  ErrorFeedback,
  Metadata,
  ResourceTypes,
} from '@cognite/data-exploration';
import { Tabs } from '@cognite/cogs.js';
import ResourceTitleRow from '@data-exploration-app/components/ResourceTitleRow';
import { Asset, CogniteError } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ResourceDetailsTabs } from '@data-exploration-app/containers/ResourceDetails';
import {
  useCurrentResourceId,
  useOnPreviewTabChange,
} from '@data-exploration-app/hooks/hooks';
import { DetailsTabWrapper } from '@data-exploration-app/containers/Common/element';
import { Breadcrumbs } from '@data-exploration-app/components/Breadcrumbs/Breadcrumbs';
import { ResourceTabType } from '@data-exploration-app/containers/ThreeD/NodePreview';
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
        tab={activeTab}
        onTabChange={onTabChange}
        additionalTabs={[
          <Tabs.Tab label="Details" key="details" tabKey="details">
            <DetailsTabWrapper>
              <AssetDetails asset={asset} />
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
