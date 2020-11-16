import React, { useEffect } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import { useLocation, useHistory } from 'react-router';
import { createLink } from '@cognite/cdf-utilities';
import { AssetDetails, AssetBreadcrumb } from 'lib/containers/Assets';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Row, Col, Space } from 'antd';
import { Asset } from '@cognite/sdk';
import { Loader, ErrorFeedback, Tabs } from 'lib/components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';
import { useCurrentResourceId } from './Exploration/hooks';

export type AssetPreviewTabType =
  | 'details'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events';

export const AssetPage = () => {
  const { id: assetIdString } = useParams<{
    id: string;
  }>();
  const assetId = parseInt(assetIdString, 10);

  useEffect(() => {
    trackUsage('Exploration.Asset', { assetId });
  }, [assetId]);

  const match = useRouteMatch();
  const location = useLocation();
  const history = useHistory();
  const activeTab = location.pathname
    .replace(match.url, '')
    .slice(1) as AssetPreviewTabType;

  const openAsset = useCurrentResourceId()[1];

  const { data: asset, isFetched, error } = useCdfItem<Asset>(
    'assets',
    { id: assetId },
    {
      enabled: !!assetId,
    }
  );

  if (!assetIdString) {
    return null;
  }

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
      <ResourceTitleRow id={assetId} type="asset" icon="DataStudio" />
      <div style={{ flexGrow: 1 }}>
        <Row>
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

        <Row style={{ height: 'calc(100% - 82px)' }}>
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
              ]}
            />
          </Col>
        </Row>
      </div>
    </>
  );
};
