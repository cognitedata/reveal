import React, { useContext, useEffect } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import { useLocation, useHistory } from 'react-router';
import { createLink } from '@cognite/cdf-utilities';
import {
  AssetDetails,
  AssetBreadcrumb,
  AssetTreeTable,
} from 'lib/containers/Assets';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';

import { Row, Col, Space } from 'antd';
import {
  Asset,
  Timeseries,
  Sequence,
  FileInfo,
  CogniteEvent,
} from '@cognite/sdk';
import { Loader, ErrorFeedback, Tabs, CdfCount } from 'lib/components';
import { useResourcePreview } from 'lib/context';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ResourceDetailsSidebar } from 'lib/containers/ResoureDetails';
import { useRelationships } from 'lib/hooks/RelationshipHooks';
import { SearchResultTable } from 'lib/components/Search/SearchPageTable';
import { ResourceItem } from 'lib/types';

export type AssetPreviewTabType =
  | 'details'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events'
  | 'children';

export const AssetPage = () => {
  const { assetId: assetIdString } = useParams<{
    assetId: string;
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

  const { mode, onSelect, resourcesState } = useContext(
    ResourceSelectionContext
  );
  const { openPreview, hidePreview } = useResourcePreview();

  const selectionProps = {
    selectionMode: mode,
    onSelect,
    isSelected: (item: ResourceItem) =>
      resourcesState.some(
        el =>
          el.state === 'selected' && el.id === item.id && el.type === item.type
      ),
  };

  const { data: asset, isFetched, error } = useCdfItem<Asset>(
    'assets',
    { id: assetId },
    {
      enabled: !!assetId,
    }
  );

  const filter = { assetSubtreeIds: [{ id: assetId }] };

  const { data: relationships } = useRelationships(asset?.externalId);

  useEffect(() => {
    if (assetId) {
      hidePreview();
    }
    return () => {
      hidePreview();
    };
  }, [hidePreview, assetId]);

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
                onBreadcrumbClick={newAsset =>
                  openPreview({
                    item: { id: newAsset.id, type: 'asset' },
                  })
                }
              />
            </Space>
          </Col>
        </Row>

        <Row style={{ height: 'calc(100% - 82px)' }}>
          <Col span={18}>
            <Tabs
              tab={activeTab}
              onTabChange={newTab =>
                history.push(
                  createLink(
                    `${match.url.substr(match.url.indexOf('/', 1))}/${newTab}`
                  )
                )
              }
            >
              <Tabs.Pane title="Asset details" key="details">
                <AssetDetails id={assetId} />
              </Tabs.Pane>
              <Tabs.Pane
                title={
                  <span>
                    Linked time series (
                    <CdfCount type="timeseries" filter={filter} />)
                  </span>
                }
                key="timeseries"
              >
                <SearchResultTable<Timeseries>
                  api="timeseries"
                  onRowClick={ts => {
                    if (ts) {
                      openPreview({
                        item: { id: ts.id, type: 'timeSeries' },
                      });
                    }
                  }}
                  filter={filter}
                  {...selectionProps}
                />
              </Tabs.Pane>
              <Tabs.Pane
                title={
                  <span>
                    Linked files (<CdfCount type="files" filter={filter} />)
                  </span>
                }
                key="files"
              >
                <SearchResultTable<FileInfo>
                  api="files"
                  onRowClick={file => {
                    if (file) {
                      openPreview({
                        item: { id: file.id, type: 'file' },
                      });
                    }
                  }}
                  filter={filter}
                  {...selectionProps}
                />
              </Tabs.Pane>
              <Tabs.Pane
                title={
                  <span>
                    Linked sequences (
                    <CdfCount type="sequences" filter={filter} />)
                  </span>
                }
                key="sequences"
              >
                <SearchResultTable<Sequence>
                  api="sequences"
                  onRowClick={sequence => {
                    if (sequence) {
                      openPreview({
                        item: { id: sequence.id, type: 'sequence' },
                      });
                    }
                  }}
                  filter={filter}
                  {...selectionProps}
                />
              </Tabs.Pane>
              <Tabs.Pane
                title={
                  <span>
                    Linked events (<CdfCount type="events" filter={filter} />)
                  </span>
                }
                key="events"
              >
                <SearchResultTable<CogniteEvent>
                  api="events"
                  onRowClick={event => {
                    if (event) {
                      openPreview({
                        item: { id: event.id, type: 'event' },
                      });
                    }
                  }}
                  filter={filter}
                  {...selectionProps}
                />
              </Tabs.Pane>
              <Tabs.Pane title="Children" key="children">
                <AssetTreeTable
                  filter={{ parentIds: [assetId] }}
                  onAssetClicked={newAsset => {
                    openPreview({
                      item: { id: newAsset.id, type: 'asset' },
                    });
                  }}
                  {...selectionProps}
                />
              </Tabs.Pane>
            </Tabs>
          </Col>
          <Col span={6}>
            <ResourceDetailsSidebar relations={relationships} />
          </Col>
        </Row>
      </div>
    </>
  );
};
