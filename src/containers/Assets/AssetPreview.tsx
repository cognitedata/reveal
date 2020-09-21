import React, { useEffect, useState, useMemo } from 'react';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import {
  itemSelector as assetSelector,
  retrieve as retrieveAsset,
} from '@cognite/cdf-resources-store/dist/assets';
import { Button, Icon, Title } from '@cognite/cogs.js';
import { AssetBreadcrumb } from '@cognite/gearbox/dist/components/AssetBreadcrumb';
import { AssetTree } from '@cognite/gearbox/dist/components/AssetTree';
import {
  linkedFilesSelectorByAssetId,
  listFilesLinkedToAsset,
} from 'modules/annotations';
import {
  list as listFiles,
  retrieve as retrieveFiles,
  listSelector as listFileSelector,
} from '@cognite/cdf-resources-store/dist/files';
import {
  list as listTimeseries,
  listSelector as listTimeseriesSelector,
} from '@cognite/cdf-resources-store/dist/timeseries';
import {
  listSelector as listEventSelector,
  list as listEvent,
} from '@cognite/cdf-resources-store/dist/events';
import {
  listSelector as listSequenceSelector,
  list as listSequence,
} from '@cognite/cdf-resources-store/dist/sequences';
import {
  TimeseriesFilterQuery,
  SequenceListScope,
  EventFilterRequest,
  FilesSearchFilter,
} from 'cognite-sdk-v3';
import {
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
import unionBy from 'lodash/unionBy';
import { DescriptionList } from '@cognite/gearbox/dist/components/DescriptionList';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import styled from 'styled-components';

const formatMetadata = (metadata: { [key: string]: any }) =>
  Object.keys(metadata).reduce(
    (agg, cur) => ({
      ...agg,
      [cur]: String(metadata[cur]) || '',
    }),
    {}
  );

const createFilesFilter = (assetId: number): FilesSearchFilter => ({
  filter: { assetSubtreeIds: [{ id: assetId }] },
  limit: 1000,
});
const createTimeseriesFilter = (assetId: number): TimeseriesFilterQuery => ({
  filter: { assetSubtreeIds: [{ id: assetId }] },
  limit: 1000,
});
const createSequenceFilter = (assetId: number): SequenceListScope => ({
  filter: { assetIds: [assetId] },
  limit: 1000,
});
const createEventFilter = (assetId: number): EventFilterRequest => ({
  filter: { assetIds: [assetId] },
  limit: 1000,
});

export const AssetPreview = ({
  assetId,
  extraActions,
}: {
  assetId: number;
  extraActions?: React.ReactNode[];
}) => {
  const { openPreview, hidePreview } = useResourcePreview();
  const dispatch = useResourcesDispatch();
  const asset = useResourcesSelector(assetSelector)(assetId);
  const {
    files: filesByAnnotations,
    fileIds: filesByAnnotationsIds,
  } = useResourcesSelector(linkedFilesSelectorByAssetId)(assetId);
  const { items: filesByAssetId } = useResourcesSelector(listFileSelector)(
    createFilesFilter(assetId),
    true
  );
  const { items: timeseries } = useResourcesSelector(listTimeseriesSelector)(
    createTimeseriesFilter(assetId),
    true
  );
  const { items: sequences } = useResourcesSelector(listSequenceSelector)(
    createSequenceFilter(assetId),
    true
  );
  const { items: events } = useResourcesSelector(listEventSelector)(
    createEventFilter(assetId),
    true
  );

  const files = unionBy(filesByAnnotations, filesByAssetId, el => el.id);

  useEffect(() => {
    (async () => {
      await dispatch(retrieveAsset([{ id: assetId }]));
      await dispatch(listFilesLinkedToAsset(assetId));
      await dispatch(listFiles(createFilesFilter(assetId), true));
      await dispatch(listTimeseries(createTimeseriesFilter(assetId), true));
      await dispatch(listEvent(createEventFilter(assetId), true));
      await dispatch(listSequence(createSequenceFilter(assetId), true));
    })();
  }, [dispatch, assetId]);

  useEffect(() => {
    if (assetId) {
      hidePreview();
    }
    return () => {
      hidePreview();
    };
  }, [dispatch, hidePreview, assetId]);

  useEffect(() => {
    if (filesByAnnotationsIds) {
      dispatch(
        retrieveFiles(filesByAnnotationsIds.map((id: number) => ({ id })))
      );
    }
  }, [dispatch, filesByAnnotationsIds]);

  const tabs = {
    'asset-metadata': 'Asset details',
    timeseries: <span>Linked time series ({timeseries.length})</span>,
    files: <span>Linked files ({files.length})</span>,
    sequences: <span>Linked sequences ({sequences.length})</span>,
    events: <span>Linked events ({events.length})</span>,
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
            <DetailsItem name="Description" value={asset?.description} />
            <DetailsItem name="Source" value={asset?.source} />
            <DetailsItem name="External ID" value={asset?.externalId} />
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
            timeseries={timeseries}
          />
        );
      }
      case 'files': {
        return (
          <FileTable
            onFileClicked={file => {
              openPreview({
                item: { id: file.id, type: 'file' },
              });
            }}
            files={files}
          />
        );
      }
      case 'sequences': {
        return (
          <SequenceTable
            onSequenceClicked={sequence => {
              openPreview({
                item: { id: sequence.id, type: 'sequence' },
              });
            }}
            sequences={sequences}
          />
        );
      }
      case 'events': {
        return (
          <EventTable
            onEventClicked={event => {
              openPreview({
                item: { id: event.id, type: 'event' },
              });
            }}
            events={events}
          />
        );
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
    timeseries,
  ]);
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
