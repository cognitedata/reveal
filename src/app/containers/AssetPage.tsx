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
import {
  RelationshipList,
  SearchResultLoader,
  TimeseriesTable,
  FileTable,
  SequenceTable,
  EventTable,
} from 'lib';
import { useRelationships } from 'lib/hooks/RelationshipHooks';
import { ResourceItem } from 'lib/types';
import { useCurrentResourceId } from './Exploration/hooks';

export type AssetPreviewTabType =
  | 'details'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events'
  | 'children';

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

  const openAsset = useCurrentResourceId()[1];

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
                <SearchResultLoader<Timeseries>
                  type="timeSeries"
                  filter={filter}
                  {...selectionProps}
                >
                  {props => (
                    <TimeseriesTable
                      {...props}
                      onRowClick={ts => {
                        if (ts) {
                          openPreview({
                            item: { id: ts.id, type: 'timeSeries' },
                          });
                        }
                      }}
                    />
                  )}
                </SearchResultLoader>
              </Tabs.Pane>
              <Tabs.Pane
                title={
                  <span>
                    Linked files (<CdfCount type="files" filter={filter} />)
                  </span>
                }
                key="files"
              >
                <SearchResultLoader<FileInfo>
                  type="file"
                  filter={filter}
                  {...selectionProps}
                >
                  {props => (
                    <FileTable
                      {...props}
                      onRowClick={file => {
                        if (file) {
                          openPreview({
                            item: { id: file.id, type: 'file' },
                          });
                        }
                      }}
                    />
                  )}
                </SearchResultLoader>
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
                <SearchResultLoader<Sequence>
                  type="sequence"
                  filter={filter}
                  {...selectionProps}
                >
                  {props => (
                    <SequenceTable
                      {...props}
                      onRowClick={sequence => {
                        if (sequence) {
                          openPreview({
                            item: { id: sequence.id, type: 'sequence' },
                          });
                        }
                      }}
                    />
                  )}
                </SearchResultLoader>
              </Tabs.Pane>
              <Tabs.Pane
                title={
                  <span>
                    Linked events (<CdfCount type="events" filter={filter} />)
                  </span>
                }
                key="events"
              >
                <SearchResultLoader<CogniteEvent>
                  type="event"
                  filter={filter}
                  {...selectionProps}
                >
                  {props => (
                    <EventTable
                      {...props}
                      onRowClick={event => {
                        if (event) {
                          openPreview({
                            item: { id: event.id, type: 'event' },
                          });
                        }
                      }}
                    />
                  )}
                </SearchResultLoader>
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
            <RelationshipList
              relations={relationships}
              onClick={item =>
                history.push(createLink(`/explore/${item.type}/${item.id}`))
              }
            />
          </Col>
        </Row>
      </div>
    </>
  );
};
