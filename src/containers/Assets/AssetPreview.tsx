import React, { useEffect, useState, useMemo } from 'react';
import { Button, Icon, Title } from '@cognite/cogs.js';
import {
  AssetBreadcrumb,
  Loader,
  ErrorFeedback,
  DetailsItem,
  Wrapper,
  TimeDisplay,
  TimeseriesTable,
  Divider,
  SequenceTable,
  EventTable,
  FileTable,
  SpacedRow,
} from 'components/Common';
import { AssetTree } from '@cognite/gearbox/dist/components/AssetTree';
import { Sequence, Asset, FileInfo, CogniteEvent } from 'cognite-sdk-v3';

import CdfCount from 'components/Common/atoms/CdfCount';

import { DescriptionList } from '@cognite/gearbox/dist/components/DescriptionList';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import styled from 'styled-components';
import { useCdfItem, useList } from 'hooks/sdk';

const formatMetadata = (metadata: { [key: string]: any }) =>
  Object.keys(metadata).reduce(
    (agg, cur) => ({
      ...agg,
      [cur]: String(metadata[cur]) || '',
    }),
    {}
  );

export const AssetPreview = ({
  assetId,
  extraActions,
}: {
  assetId: number;
  extraActions?: React.ReactNode[];
}) => {
  const { openPreview, hidePreview } = useResourcePreview();

  const { data: asset, isFetched, error } = useCdfItem<Asset>(
    'assets',
    assetId,
    {
      enabled: !!assetId,
    }
  );

  const assetFilter = { assetIds: [assetId] };
  const assetSubtreeFilter = { assetSubtreeIds: [{ id: assetId }] };
  const { data: files } = useList<FileInfo>('files', 100, assetSubtreeFilter, {
    enabled: isFetched,
  });

  const { data: sequences } = useList<Sequence>('sequences', 100, assetFilter, {
    enabled: isFetched,
  });
  const { data: events } = useList<CogniteEvent>('events', 100, assetFilter, {
    enabled: isFetched,
  });

  // const files = unionBy(filesByAnnotations, filesByAssetId, el => el.id);

  useEffect(() => {
    if (assetId) {
      hidePreview();
    }
    return () => {
      hidePreview();
    };
  }, [hidePreview, assetId]);

  const tabs = {
    'asset-metadata': 'Asset details',
    timeseries: (
      <span>
        Linked time series (
        <CdfCount type="timeseries" filter={assetSubtreeFilter} />)
      </span>
    ),
    files: (
      <span>
        Linked files (<CdfCount type="files" filter={assetFilter} />)
      </span>
    ),
    sequences: (
      <span>
        Linked sequences (<CdfCount type="sequences" filter={assetFilter} />)
      </span>
    ),
    events: (
      <span>
        Linked events (<CdfCount type="events" filter={assetFilter} />)
      </span>
    ),
    children: 'Children',
  };

  const [currentTab, setTab] = useState<keyof typeof tabs>('asset-metadata');

  const content = useMemo(() => {
    switch (currentTab) {
      case 'asset-metadata': {
        return (
          <>
            <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
              Details
            </Title>
            <DetailsItem name="ID" value={asset?.id} />
            <DetailsItem name="Description" value={asset?.description} />
            <DetailsItem name="Source" value={asset?.source} />
            <DetailsItem name="External ID" value={asset?.externalId} />
            <DetailsItem name="Parent ID" value={asset?.parentId} />
            <DetailsItem
              name="Created at"
              value={
                asset ? <TimeDisplay value={asset.createdTime} /> : 'Loading...'
              }
            />
            <DetailsItem
              name="Updated at"
              value={
                asset ? (
                  <TimeDisplay value={asset.lastUpdatedTime} />
                ) : (
                  'Loading...'
                )
              }
            />
            <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
              Metadata
            </Title>
            <DescriptionList
              valueSet={formatMetadata((asset && asset.metadata) ?? {})}
            />
          </>
        );
      }
      case 'timeseries': {
        return (
          <TimeseriesTable
            onTimeseriesClicked={ts => {
              if (ts) {
                openPreview({
                  item: { id: ts.id, type: 'timeSeries' },
                });
              }
            }}
            filter={assetSubtreeFilter}
          />
        );
      }
      case 'files': {
        return files ? (
          <FileTable
            onFileClicked={file => {
              openPreview({
                item: { id: file.id, type: 'file' },
              });
            }}
            files={files}
          />
        ) : null;
      }
      case 'sequences': {
        return sequences ? (
          <SequenceTable
            onSequenceClicked={sequence => {
              openPreview({
                item: { id: sequence.id, type: 'sequence' },
              });
            }}
            sequences={sequences}
          />
        ) : null;
      }
      case 'events': {
        return events ? (
          <EventTable
            onEventClicked={event => {
              openPreview({
                item: { id: event.id, type: 'event' },
              });
            }}
            events={events}
          />
        ) : null;
      }
      case 'children': {
        return (
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
        );
      }
    }
    return <></>;
  }, [
    asset,
    assetId,
    currentTab,
    events,
    files,
    openPreview,
    sequences,
    assetSubtreeFilter,
  ]);

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
        <Icon type="DataStudio" /> {asset ? asset.name : 'Loading...'}
      </h1>
      <SpacedRow>{extraActions}</SpacedRow>
      <SpacedRow>
        {Object.keys(tabs).map(el => {
          const key = el as keyof typeof tabs;
          return (
            <Button
              variant={key === currentTab ? 'default' : 'ghost'}
              type={key === currentTab ? 'primary' : 'secondary'}
              onClick={() => setTab(key)}
              key={key}
            >
              {tabs[key]}
            </Button>
          );
        })}
      </SpacedRow>
      <Divider.Horizontal />
      <PreviewWrapper>{content}</PreviewWrapper>
    </Wrapper>
  );
};

const PreviewWrapper = styled.div`
  height: 100%;
`;
