import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import collapseStyles from 'rc-collapse/assets/index.css';
import {
  Input,
  Collapse,
  Title,
  Badge,
  Icon,
  Colors,
  Button,
} from '@cognite/cogs.js';
import {
  CogniteAnnotation,
  AnnotationResourceType,
} from '@cognite/annotations';
import {
  FilesMetadata,
  Asset,
  GetTimeSeriesMetadataDTO,
  Sequence,
  CogniteEvent,
} from '@cognite/sdk';
import { useDispatch, useSelector } from 'react-redux';
import {
  itemSelector as fileSelector,
  retrieve as retrieveFile,
  retrieveExternal as retrieveExternalFile,
} from 'modules/files';
import {
  itemSelector as assetSelector,
  retrieve as retrieveAsset,
  retrieveExternal as retrieveExternalAsset,
} from 'modules/assets';
import {
  itemSelector as timeseriesSelector,
  retrieve as retrieveTimeSeries,
  retrieveExternal as retrieveExternalTimeSeries,
} from 'modules/timeseries';
import {
  itemSelector as eventSelector,
  retrieve as retrieveEvent,
  retrieveExternal as retrieveExternalEvent,
} from 'modules/events';
import {
  itemSelector as sequenceSelector,
  retrieve as retrieveSequence,
  retrieveExternal as retrieveExternalSequence,
} from 'modules/sequences';
import { DetailsItem, InfoGrid, FileDetailsAbstract } from 'components/Common';
import { onResourceSelected } from 'modules/app';
import { useHistory } from 'react-router-dom';
import {
  AssetItem,
  EventItem,
  SequenceItem,
  FileItem,
  TimeseriesItem,
} from './FilePreviewOverviewItems';

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px 16px;
  box-sizing: border-box;
  z-index: 1;
  background: #fff;
  border-right: 2px solid ${Colors['greyscale-grey2'].hex()};
  width: 100%;
  height: 100%;
  margin-right: 20px;
  overflow: auto;
  h1 {
    margin-bottom: 0px;
    flex: 1;
  }
  .input-wrapper {
    width: 100%;
  }
  .content {
    flex: 1;
    overflow: auto;
    width: 100%;
  }
  &&& .rc-collapse,
  &&& .rc-collapse > .rc-collapse-item {
    border: none;
    width: 100%;
    background: #fff;
  }
  &&& .rc-collapse-header {
    background: #fff;
    outline: none;
  }
  &&& .rc-collapse-content > .rc-collapse-content-box {
    margin-top: 0px;
  }
`;
const SidebarHeader = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding-bottom: 16px;
`;

const CollapseHeader = styled.div`
  display: flex;
  align-items: center;
  background: #fff;
  flex-direction: row;
  width: 100%;
  .resource-icon {
    margin-right: 4px;
  }
  .spacer {
    flex: 1;
  }
  .cogs-badge {
    padding: 4px 8px !important;
    color: #4e4f60 !important;
    font-weight: 800;
  }
`;

const Tabs = styled.div`
  margin-top: 12px;
  margin-bottom: 16px;
  margin-left: -6px;
  && > * {
    padding-left: 6px;
    padding-right: 6px;
    margin-right: 24px;
  }
`;

type FilePreviewOverviewProps = {
  file: FilesMetadata;
  annotations: CogniteAnnotation[];
  extras?: React.ReactNode;
  page?: number;
  onPageChange: (page: number) => void;
  onAssetClicked?: (item: Asset) => void;
  onFileClicked?: (item: FilesMetadata) => void;
  onTimeseriesClicked?: (item: GetTimeSeriesMetadataDTO) => void;
  onEventClicked?: (item: CogniteEvent) => void;
  onSequenceClicked?: (item: Sequence) => void;
};

type CategorizedAnnotations = {
  [key in AnnotationResourceType]: {
    annotations: CogniteAnnotation[];
    ids: Set<number | string>;
  };
};

export const FilePreviewOverview = ({
  file,
  page,
  extras,
  annotations,
  onPageChange,
  onAssetClicked,
  onFileClicked,
  onTimeseriesClicked,
  onEventClicked,
  onSequenceClicked,
}: FilePreviewOverviewProps) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [currentTab, setTab] = useState('resources');
  const [open, setOpen] = useState<string[]>([]);
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    collapseStyles.use();
    return () => {
      collapseStyles.unuse();
    };
  });

  const onAssetClickedCallback =
    onAssetClicked ||
    (item => {
      dispatch(
        onResourceSelected(
          {
            showSidebar: true,
            assetId: item.id,
          },
          history
        )
      );
    });
  const onFileClickedCallback =
    onFileClicked ||
    (item => {
      dispatch(
        onResourceSelected(
          {
            showSidebar: true,
            fileId: item.id,
          },
          history
        )
      );
    });
  const onTimeseriesClickedCallback =
    onTimeseriesClicked ||
    (item => {
      dispatch(
        onResourceSelected(
          {
            showSidebar: true,
            timeseriesId: item.id,
          },
          history
        )
      );
    });
  const onEventClickedCallback =
    onEventClicked ||
    (item => {
      dispatch(
        onResourceSelected(
          {
            showSidebar: true,
            eventId: item.id,
          },
          history
        )
      );
    });
  const onSequenceClickedCallback =
    onSequenceClicked ||
    (item => {
      dispatch(
        onResourceSelected(
          {
            showSidebar: true,
            sequenceId: item.id,
          },
          history
        )
      );
    });
  const categorizedAnnotations: CategorizedAnnotations = {
    file: { annotations: [], ids: new Set() },
    asset: { annotations: [], ids: new Set() },
    timeSeries: { annotations: [], ids: new Set() },
    threeD: { annotations: [], ids: new Set() },
    threeDRevision: { annotations: [], ids: new Set() },
    event: { annotations: [], ids: new Set() },
    sequence: { annotations: [], ids: new Set() },
  };

  annotations.forEach(annotation => {
    if (
      annotation.resourceType &&
      (annotation.resourceExternalId || annotation.resourceId)
    ) {
      categorizedAnnotations[annotation.resourceType].annotations.push(
        annotation
      );
      categorizedAnnotations[annotation.resourceType].ids.add(
        annotation.resourceExternalId || annotation.resourceId!
      );
    }
  });

  const fileIds = Array.from(categorizedAnnotations.file.ids);
  useEffect(() => {
    dispatch(
      retrieveFile(
        (fileIds.filter(el => typeof el === 'number') as number[]).map(id => ({
          id,
        }))
      )
    );
    dispatch(
      retrieveExternalFile(
        (fileIds.filter(el => typeof el === 'string') as string[]).map(
          externalId => ({
            externalId,
          })
        )
      )
    );
  }, [dispatch, fileIds]);

  const assetIds = Array.from(categorizedAnnotations.asset.ids);
  useEffect(() => {
    dispatch(
      retrieveAsset(
        (assetIds.filter(el => typeof el === 'number') as number[]).map(id => ({
          id,
        }))
      )
    );
    dispatch(
      retrieveExternalAsset(
        (assetIds.filter(el => typeof el === 'string') as string[]).map(
          externalId => ({
            externalId,
          })
        )
      )
    );
  }, [dispatch, assetIds]);

  const timeseriesIds = Array.from(categorizedAnnotations.timeSeries.ids);
  useEffect(() => {
    dispatch(
      retrieveTimeSeries(
        (timeseriesIds.filter(el => typeof el === 'number') as number[]).map(
          id => ({
            id,
          })
        )
      )
    );
    dispatch(
      retrieveExternalTimeSeries(
        (timeseriesIds.filter(el => typeof el === 'string') as string[]).map(
          externalId => ({
            externalId,
          })
        )
      )
    );
  }, [dispatch, timeseriesIds]);

  const eventIds = Array.from(categorizedAnnotations.event.ids);
  useEffect(() => {
    dispatch(
      retrieveEvent(
        (eventIds.filter(el => typeof el === 'number') as number[]).map(id => ({
          id,
        }))
      )
    );
    dispatch(
      retrieveExternalEvent(
        (eventIds.filter(el => typeof el === 'string') as string[]).map(
          externalId => ({
            externalId,
          })
        )
      )
    );
  }, [dispatch, eventIds]);

  const sequenceIds = Array.from(categorizedAnnotations.sequence.ids);
  useEffect(() => {
    dispatch(
      retrieveSequence(
        (sequenceIds.filter(el => typeof el === 'number') as number[]).map(
          id => ({
            id,
          })
        )
      )
    );
    dispatch(
      retrieveExternalSequence(
        (sequenceIds.filter(el => typeof el === 'string') as string[]).map(
          externalId => ({
            externalId,
          })
        )
      )
    );
  }, [dispatch, sequenceIds]);

  const getAsset = useSelector(assetSelector);
  const getTimeseries = useSelector(timeseriesSelector);
  const getFile = useSelector(fileSelector);
  const getSequence = useSelector(sequenceSelector);
  const getEvent = useSelector(eventSelector);

  const renderDetectedResources = () => {
    return (
      <>
        <Input
          style={{ width: '100%' }}
          containerStyle={{ width: '100%', marginBottom: 16 }}
          variant="noBorder"
          icon="Search"
          placeholder="Search for resource in file..."
          onChange={ev => setQuery(ev.target.value)}
          value={query}
        />
        <Collapse
          // @ts-ignore
          onChange={(key?: string[]) => setOpen(key || [])}
          activeKey={open}
        >
          {/** Assets */}
          <Collapse.Panel
            showArrow={false}
            key="assets"
            header={
              <CollapseHeader>
                <Icon className="cogs-icon resource-icon" type="DataStudio" />
                <Title level={5}>Assets</Title>
                <div className="spacer" />
                <Badge
                  text={`${categorizedAnnotations.asset.annotations.length}`}
                  background={Colors['purple-5'].hex()}
                />
                <Icon type={open.includes('assets') ? 'Up' : 'Down'} />
              </CollapseHeader>
            }
          >
            <div>
              {assetIds.map(id => {
                const asset = getAsset(id);
                if (asset && query.length > 0) {
                  if (
                    `${asset.name}${asset.description}`
                      .toLocaleLowerCase()
                      .indexOf(query.toLocaleLowerCase()) === -1
                  ) {
                    return null;
                  }
                }
                return (
                  <FilePreviewOverview.AssetItem
                    onItemClick={() => asset && onAssetClickedCallback(asset)}
                    key={id}
                    asset={asset}
                    currentPage={page}
                    query={query}
                    annotations={categorizedAnnotations.asset.annotations.filter(
                      el =>
                        asset &&
                        ((el.resourceId && el.resourceId === asset.id) ||
                          (el.resourceExternalId &&
                            el.resourceExternalId === asset.externalId))
                    )}
                    selectPage={onPageChange}
                  />
                );
              })}
            </div>
          </Collapse.Panel>

          {/** Files */}
          <Collapse.Panel
            showArrow={false}
            key="files"
            header={
              <CollapseHeader>
                <Icon className="cogs-icon resource-icon" type="Document" />
                <Title level={5}>Files</Title>
                <div className="spacer" />
                <Badge
                  text={`${categorizedAnnotations.file.annotations.length}`}
                  background={Colors['midorange-5'].hex()}
                />
                <Icon type={open.includes('files') ? 'Up' : 'Down'} />
              </CollapseHeader>
            }
          >
            <div>
              {fileIds.map(id => {
                const linkedFile = getFile(id);
                if (file && query.length > 0) {
                  if (
                    `${file!.name}`
                      .toLocaleLowerCase()
                      .indexOf(query.toLocaleLowerCase()) === -1
                  ) {
                    return null;
                  }
                }
                return (
                  <FilePreviewOverview.FileItem
                    onItemClick={() => file && onFileClickedCallback(file)}
                    key={id}
                    file={linkedFile}
                    currentPage={page}
                    query={query}
                    annotations={categorizedAnnotations.file.annotations.filter(
                      el =>
                        linkedFile &&
                        ((el.resourceId && el.resourceId === linkedFile.id) ||
                          (el.resourceExternalId &&
                            el.resourceExternalId === linkedFile.externalId))
                    )}
                    selectPage={onPageChange}
                  />
                );
              })}
            </div>
          </Collapse.Panel>

          {/** Time Series */}
          <Collapse.Panel
            showArrow={false}
            key="timeseries"
            header={
              <CollapseHeader>
                <Icon className="cogs-icon resource-icon" type="Timeseries" />
                <Title level={5}>Time Series</Title>
                <div className="spacer" />
                <Badge
                  text={`${categorizedAnnotations.timeSeries.annotations.length}`}
                  background={Colors['lightblue-5'].hex()}
                />
                <Icon type={open.includes('timeseries') ? 'Up' : 'Down'} />
              </CollapseHeader>
            }
          >
            <div>
              {timeseriesIds.map(id => {
                const timeseries = getTimeseries(id);
                if (timeseries && query.length > 0) {
                  if (
                    `${timeseries.name}${timeseries.externalId}${timeseries.description}${timeseries.id}`
                      .toLocaleLowerCase()
                      .indexOf(query.toLocaleLowerCase()) === -1
                  ) {
                    return null;
                  }
                }
                return (
                  <FilePreviewOverview.TimeseriesItem
                    onItemClick={() =>
                      timeseries && onTimeseriesClickedCallback(timeseries)
                    }
                    key={id}
                    timeseries={timeseries}
                    currentPage={page}
                    query={query}
                    annotations={categorizedAnnotations.timeSeries.annotations.filter(
                      el =>
                        timeseries &&
                        ((el.resourceId && el.resourceId === timeseries.id) ||
                          (el.resourceExternalId &&
                            el.resourceExternalId === timeseries.externalId))
                    )}
                    selectPage={onPageChange}
                  />
                );
              })}
            </div>
          </Collapse.Panel>

          {/** Events */}
          <Collapse.Panel
            key="events"
            showArrow={false}
            header={
              <CollapseHeader>
                <Icon className="cogs-icon resource-icon" type="Events" />
                <Title level={5}>Events</Title>
                <div className="spacer" />
                <Badge
                  text={`${categorizedAnnotations.event.annotations.length}`}
                  background={Colors['pink-5'].hex()}
                />
                <Icon type={open.includes('events') ? 'Up' : 'Down'} />
              </CollapseHeader>
            }
          >
            <div>
              {eventIds.map(id => {
                const event = getEvent(id);
                if (event && query.length > 0) {
                  if (
                    `${event.type}${event.subtype}${event.description}`
                      .toLocaleLowerCase()
                      .indexOf(query.toLocaleLowerCase()) === -1
                  ) {
                    return null;
                  }
                }
                return (
                  <FilePreviewOverview.EventItem
                    onItemClick={() => event && onEventClickedCallback(event)}
                    key={id}
                    event={event}
                    currentPage={page}
                    query={query}
                    annotations={categorizedAnnotations.event.annotations.filter(
                      el =>
                        event &&
                        ((el.resourceId && el.resourceId === event.id) ||
                          (el.resourceExternalId &&
                            el.resourceExternalId === event.externalId))
                    )}
                    selectPage={onPageChange}
                  />
                );
              })}
            </div>
          </Collapse.Panel>

          {/** Sequences */}
          <Collapse.Panel
            showArrow={false}
            key="sequences"
            header={
              <CollapseHeader>
                <Icon className="cogs-icon resource-icon" type="GridFilled" />
                <Title level={5}>Sequences</Title>
                <div className="spacer" />
                <Badge
                  text={`${categorizedAnnotations.sequence.annotations.length}`}
                  background={Colors['yellow-5'].hex()}
                />
                <Icon type={open.includes('sequences') ? 'Up' : 'Down'} />
              </CollapseHeader>
            }
          >
            <div>
              {sequenceIds.map(id => {
                const sequence = getSequence(id);
                if (sequence && query.length > 0) {
                  if (
                    `${sequence.name}${sequence.externalId}${sequence.description}${sequence.id}`
                      .toLocaleLowerCase()
                      .indexOf(query.toLocaleLowerCase()) === -1
                  ) {
                    return null;
                  }
                }
                return (
                  <FilePreviewOverview.SequenceItem
                    onItemClick={() =>
                      sequence && onSequenceClickedCallback(sequence)
                    }
                    key={id}
                    sequence={sequence}
                    currentPage={page}
                    query={query}
                    annotations={categorizedAnnotations.sequence.annotations.filter(
                      el =>
                        sequence &&
                        ((el.resourceId && el.resourceId === sequence.id) ||
                          (el.resourceExternalId &&
                            el.resourceExternalId === sequence.externalId))
                    )}
                    selectPage={onPageChange}
                  />
                );
              })}
            </div>
          </Collapse.Panel>
        </Collapse>
      </>
    );
  };

  const renderFileDetails = () => {
    return (
      <>
        <FileDetailsAbstract.FileInfoGrid file={file} />
        {file && file!.metadata && (
          <InfoGrid noBorders>
            {Object.keys(file!.metadata).map(key => (
              <DetailsItem name={key} value={file!.metadata![key]} />
            ))}
          </InfoGrid>
        )}
      </>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Title
          level="3"
          style={{ flex: 1, wordBreak: 'break-all', marginRight: 6 }}
        >
          {file.name}
        </Title>
      </SidebarHeader>
      {extras}
      <Tabs>
        <Button variant="ghost" onClick={() => setTab('resources')}>
          <Title
            level={5}
            style={{
              color:
                currentTab === 'resources' ? Colors.midblue.hex() : 'inherit',
            }}
          >
            Detected Resources
          </Title>
        </Button>
        <Button variant="ghost" onClick={() => setTab('fileInfo')}>
          <Title
            level={5}
            style={{
              color:
                currentTab !== 'resources' ? Colors.midblue.hex() : 'inherit',
            }}
          >
            File Info
          </Title>
        </Button>
      </Tabs>
      <div className="content">
        {currentTab === 'resources'
          ? renderDetectedResources()
          : renderFileDetails()}
      </div>
    </Sidebar>
  );
};

FilePreviewOverview.AssetItem = AssetItem;

FilePreviewOverview.TimeseriesItem = TimeseriesItem;

FilePreviewOverview.FileItem = FileItem;

FilePreviewOverview.SequenceItem = SequenceItem;

FilePreviewOverview.EventItem = EventItem;
