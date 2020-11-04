import React, { useEffect } from 'react';
import { Row, Col, Space } from 'antd';
import {
  Asset,
  Timeseries,
  Sequence,
  FileInfo,
  CogniteEvent,
} from '@cognite/sdk';
import {
  Loader,
  ErrorFeedback,
  SpacedRow,
  Tabs,
  CdfCount,
} from 'lib/components';
import { useResourcePreview } from 'lib/context';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import {
  AssetDetails,
  AssetBreadcrumb,
  AssetTreeTable,
} from 'lib/containers/Assets';
import { ResourceDetailsSidebar } from 'lib/containers/ResoureDetails';
import { useRelationships } from 'lib/hooks/RelationshipHooks';
import { SearchResultTable } from 'lib/components/Search/SearchPageTable';

export type AssetPreviewTabType =
  | 'details'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events'
  | 'children';

export const AssetPreview = ({
  assetId,
  extraActions,
  tab,
  onTabChange,
}: {
  assetId: number;
  extraActions?: React.ReactNode[];
  tab?: AssetPreviewTabType;
  onTabChange?: (tab: AssetPreviewTabType) => void;
}) => {
  const { openPreview, hidePreview } = useResourcePreview();

  const { data: asset, isFetched, error } = useCdfItem<Asset>(
    'assets',
    { id: assetId },
    {
      enabled: !!assetId,
    }
  );

  const filter = { assetSubtreeIds: [{ id: assetId }] };
  // const files = unionBy(filesByAnnotations, filesByAssetId, el => el.id);

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
    return <ErrorFeedback error="Asset not found" />;
  }

  return (
    <>
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
      <Row gutter={16}>
        <Col span={18}>
          <SpacedRow>{extraActions}</SpacedRow>
          <Tabs tab={tab} onTabChange={onTabChange}>
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
              />
            </Tabs.Pane>
          </Tabs>
        </Col>
        <Col span={6}>
          <ResourceDetailsSidebar relations={relationships} />
        </Col>
      </Row>
    </>
  );
};
