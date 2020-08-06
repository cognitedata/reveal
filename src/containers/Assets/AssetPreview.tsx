import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  itemSelector as assetSelector,
  retrieve as retrieveAsset,
} from 'modules/assets';
import { Icon, Title } from '@cognite/cogs.js';
import { List, Tabs, message, Row } from 'antd';
import { AssetBreadcrumb } from '@cognite/gearbox/dist/components/AssetBreadcrumb';
import { AssetDetailsPanel } from '@cognite/gearbox/dist/components/AssetDetailsPanel';
import { AssetTree } from '@cognite/gearbox/dist/components/AssetTree';
import { TimeseriesPreview } from '@cognite/gearbox/dist/components/TimeseriesPreview';
import {
  linkedFilesSelectorByAssetId,
  listFilesLinkedToAsset,
} from 'modules/annotations';
import {
  list as listFiles,
  retrieve as retrieveFiles,
  listSelector as listFileSelector,
} from 'modules/files';
import {
  list as listTimeseries,
  listSelector as listTimeseriesSelector,
} from 'modules/timeseries';
import {
  listSelector as listEventSelector,
  list as listEvent,
} from 'modules/events';
import {
  listSelector as listSequenceSelector,
  list as listSequence,
} from 'modules/sequences';
import {
  TimeseriesFilterQuery,
  SequenceListScope,
  EventFilterRequest,
  FilesSearchFilter,
} from '@cognite/sdk';
import { onResourceSelected } from 'modules/app';
import { useHistory } from 'react-router-dom';
import { DetailsItem, Wrapper } from 'components/Common';
import moment from 'moment';
import unionBy from 'lodash/unionBy';

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
  const history = useHistory();
  const dispatch = useDispatch();
  const asset = useSelector(assetSelector)(assetId);
  const {
    files: filesByAnnotations,
    fileIds: filesByAnnotationsIds,
  } = useSelector(linkedFilesSelectorByAssetId)(assetId);
  const { items: filesByAssetId } = useSelector(listFileSelector)(
    createFilesFilter(assetId),
    true
  );
  const { items: timeseries } = useSelector(listTimeseriesSelector)(
    createTimeseriesFilter(assetId),
    true
  );
  const { items: sequences } = useSelector(listSequenceSelector)(
    createSequenceFilter(assetId),
    true
  );
  const { items: events } = useSelector(listEventSelector)(
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
    if (filesByAnnotationsIds) {
      dispatch(retrieveFiles(filesByAnnotationsIds.map(id => ({ id }))));
    }
  }, [dispatch, filesByAnnotationsIds]);

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
            dispatch(onResourceSelected({ assetId: newAsset.id }, history))
          }
        />
      </div>
      <h1>
        <Icon type="DataStudio" /> {asset ? asset.name : 'Loading...'}
      </h1>

      <Row type="flex" gutter={12} justify="start" className="button-row">
        {extraActions}
      </Row>
      <Tabs>
        <Tabs.TabPane key="asset-metadata" tab="Asset Details">
          <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
            Details
          </Title>
          <DetailsItem name="Description" value={asset?.description} />
          <DetailsItem name="Source" value={asset?.source} />
          <DetailsItem name="External ID" value={asset?.externalId} />
          <DetailsItem
            name="Created at"
            value={
              asset
                ? moment(asset.createdTime).format('MM/DD/YYYY HH:MM')
                : 'Loading...'
            }
          />
          <DetailsItem
            name="Updated at"
            value={
              asset
                ? moment(asset.lastUpdatedTime).format('MM/DD/YYYY HH:MM')
                : 'Loading...'
            }
          />
          <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
            Metadata
          </Title>
          <AssetDetailsPanel assetId={assetId} />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="timeseries"
          tab={<span>Linked Timeseries ({timeseries.length})</span>}
        >
          <List
            renderItem={ts => (
              <List.Item
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (ts) {
                    dispatch(
                      onResourceSelected(
                        {
                          timeseriesId: ts.id,
                          showSidebar: true,
                        },
                        history
                      )
                    );
                  }
                }}
              >
                <TimeseriesPreview timeseriesId={ts.id} />
              </List.Item>
            )}
            pagination={{ position: 'bottom' }}
            dataSource={timeseries}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="files"
          tab={<span>Linked Files ({files.length})</span>}
        >
          <List
            renderItem={file => (
              <List.Item
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (file) {
                    dispatch(
                      onResourceSelected(
                        { fileId: file.id, showSidebar: true },
                        history
                      )
                    );
                  }
                }}
              >
                <List.Item.Meta
                  title={file.name}
                  description={file.externalId}
                />
              </List.Item>
            )}
            pagination={{ position: 'bottom' }}
            dataSource={files}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="sequences"
          tab={<span>Linked Sequences ({sequences.length})</span>}
        >
          <List
            renderItem={sequence => (
              <List.Item
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (sequence) {
                    dispatch(
                      onResourceSelected(
                        { sequenceId: sequence.id, showSidebar: true },
                        history
                      )
                    );
                  }
                }}
              >
                <List.Item.Meta
                  title={sequence.name}
                  description={sequence.externalId}
                />
              </List.Item>
            )}
            pagination={{ position: 'bottom' }}
            dataSource={sequences}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="events"
          tab={<span>Linked Events ({events.length})</span>}
        >
          <List
            renderItem={event => (
              <List.Item
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (event) {
                    message.info('Coming soon...');
                    // dispatch(
                    //   onResourceSelected(
                    //     { eventId: event.id, showSidebar: true },
                    //     history
                    //   )
                    // );
                  }
                }}
              >
                <List.Item.Meta
                  title={`${[event.type, event.subtype]
                    .filter(el => !!el)
                    .join(' - ')}: ${event.externalId || event.id}`}
                  description={event.externalId}
                />
              </List.Item>
            )}
            pagination={{ position: 'bottom' }}
            dataSource={events}
          />
        </Tabs.TabPane>
        <Tabs.TabPane key="children" tab="Children">
          <AssetTree
            assetIds={[assetId]}
            defaultExpandedKeys={[assetId]}
            onSelect={newAsset => {
              if (newAsset.node) {
                dispatch(
                  onResourceSelected(
                    {
                      assetId: newAsset.node.id,
                      showSidebar: true,
                    },
                    history
                  )
                );
              }
            }}
          />
        </Tabs.TabPane>
      </Tabs>
    </Wrapper>
  );
};
