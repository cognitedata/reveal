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
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Space, Row, Col } from 'antd';
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
    trackUsage('Exploration.Asset', { assetId });
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
      <div style={{ flexGrow: 1 }}>
        <Row style={{ marginLeft: 16 }}>
          <Col span={24}>
            <Space align="center">
              <p>LOCATION:</p>
              <AssetBreadcrumb
                assetId={assetId}
                onBreadcrumbClick={newAsset => openAsset(newAsset.id)}
              />
            </Space>
          </Col>
        </Row>
        <Row style={{ height: 'calc(100% - 82px)', marginLeft: 16 }}>
          <Col span={24}>
            <ResourceDetailsTabs
              parentResource={{
                type: 'asset',
                id: asset.id,
                externalId: asset.externalId,
              }}
              tab={activeTab}
              onTabChange={newTab =>
                history.push(
                  createLink(
                    `${match.url.substr(match.url.indexOf('/', 1))}/${newTab}`
                  )
                )
              }
              excludedTypes={['asset']}
              additionalTabs={[
                <Tabs.Pane title={<TabTitle>Details</TabTitle>} key="details">
                  <AssetDetails id={assetId} />
                </Tabs.Pane>,
                <Tabs.Pane title={<TabTitle>Children</TabTitle>} key="children">
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
          </Col>
        </Row>
      </div>
    </>
  );
};
