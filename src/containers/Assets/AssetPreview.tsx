import React, { useEffect } from 'react';
import { Icon } from '@cognite/cogs.js';
import {
  AssetBreadcrumb,
  Loader,
  ErrorFeedback,
  Wrapper,
  SpacedRow,
  Tabs,
  CdfCount,
  ResourceTable,
} from 'components/Common';
import { AssetTree } from '@cognite/gearbox/dist/components/AssetTree';
import {
  Asset,
  Timeseries,
  Sequence,
  FileInfo,
  CogniteEvent,
} from '@cognite/sdk';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import { useCdfItem } from 'hooks/sdk';
import AssetDetails from './AssetDetails';

export const AssetPreview = ({
  assetId,
  extraActions,
  tab,
  onTabChange,
}: {
  assetId: number;
  extraActions?: React.ReactNode[];
  tab?: string;
  onTabChange?: (tab: string) => void;
}) => {
  const { openPreview, hidePreview } = useResourcePreview();

  const { data: asset, isFetched, error } = useCdfItem<Asset>(
    'assets',
    assetId,
    {
      enabled: !!assetId,
    }
  );

  const filter = { assetSubtreeIds: [{ id: assetId }] };
  // const files = unionBy(filesByAnnotations, filesByAssetId, el => el.id);

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

  return (
    <Wrapper>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <span style={{ marginRight: '12px' }}>LOCATION:</span>
        <AssetBreadcrumb
          assetId={assetId}
          onBreadcrumbClick={newAsset =>
            openPreview({
              item: { id: newAsset.id, type: 'asset' },
            })
          }
        />
      </div>
      <h1>
        <Icon type="DataStudio" /> {asset?.name}
      </h1>
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
          <ResourceTable<Timeseries>
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
          <ResourceTable<FileInfo>
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
              Linked sequences (<CdfCount type="sequences" filter={filter} />)
            </span>
          }
          key="sequences"
        >
          <ResourceTable<Sequence>
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
          <ResourceTable<CogniteEvent>
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
          <AssetTree
            assetIds={[assetId]}
            defaultExpandedKeys={[assetId]}
            onSelect={newAsset => {
              if (newAsset.node) {
                openPreview({
                  item: { id: newAsset.node!.id, type: 'asset' },
                });
              }
            }}
          />
        </Tabs.Pane>
      </Tabs>
    </Wrapper>
  );
};
