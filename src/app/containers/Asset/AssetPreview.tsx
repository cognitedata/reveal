import React, { useEffect, useContext } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import { useLocation, useHistory } from 'react-router';
import { createLink } from '@cognite/cdf-utilities';
import {
  AssetDetails,
  AssetBreadcrumb,
  AssetTreeTable,
} from 'lib/containers/Assets';
import Metadata from 'lib/components/Details/Metadata';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Space } from 'antd';
import { Asset } from '@cognite/sdk';
import { Loader, ErrorFeedback, Tabs } from 'lib/components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';
import { useCurrentResourceId } from 'app/hooks';
import { TitleRowActionsProps } from 'app/components/TitleRowActions';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';
import { ResourceItem } from 'lib/types';

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
  actions?: TitleRowActionsProps['actions'];
}) => {
  useEffect(() => {
    trackUsage('Exploration.Preview.Asset', { assetId });
  }, [assetId]);

  const match = useRouteMatch();
  const location = useLocation();
  const history = useHistory();
  const activeTab = location.pathname
    .replace(match.url, '')
    .slice(1) as AssetPreviewTabType;

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

  const { data: asset, isFetched, error } = useCdfItem<Asset>(
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
        actions={actions}
      />
      <Space align="center" style={{ marginLeft: '16px' }}>
        <p>LOCATION:</p>
        <AssetBreadcrumb
          assetId={assetId}
          onBreadcrumbClick={newAsset => openAsset(newAsset.id)}
        />
      </Space>
      <ResourceDetailsTabs
        parentResource={{
          type: 'asset',
          id: asset.id,
          externalId: asset.externalId,
        }}
        tab={activeTab}
        onTabChange={newTab => {
          history.push(
            createLink(
              `${match.url.substr(match.url.indexOf('/', 1))}/${newTab}`
            )
          );
          trackUsage('Exploration.Details.TabChange', {
            type: 'asset',
            tab: newTab,
          });
        }}
        excludedTypes={['asset']}
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
              onAssetClicked={newAsset => openAsset(newAsset.id)}
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
