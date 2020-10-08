import React, { useState } from 'react';
import styled from 'styled-components';
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
  FileInfo,
  Asset,
  Timeseries,
  Sequence,
  CogniteEvent,
} from '@cognite/sdk';
import { DetailsItem, InfoGrid, FileDetailsAbstract } from 'components/Common';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import { useViewerQuery } from '@cognite/react-picture-annotation';
import { useCdfItems } from 'hooks/sdk';
import { getIdParam } from 'helpers';
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
  file: FileInfo;
  annotations: CogniteAnnotation[];
  extras?: React.ReactNode;
  page?: number;
  onPageChange: (page: number) => void;
  onAssetClicked?: (item: Asset) => void;
  onFileClicked?: (item: FileInfo) => void;
  onTimeseriesClicked?: (item: Timeseries) => void;
  onEventClicked?: (item: CogniteEvent) => void;
  onSequenceClicked?: (item: Sequence) => void;
};

type CategorizedAnnotations = {
  [key in AnnotationResourceType]: {
    annotations: CogniteAnnotation[];
    ids: Set<number | string>;
  };
};

// TODO(DE-140) make onclicks also highlight annotations
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
  const { query, setQuery } = useViewerQuery();
  const { openPreview } = useResourcePreview();
  const [currentTab, setTab] = useState('resources');
  const [open, setOpen] = useState<string[]>([]);

  const onAssetClickedCallback =
    onAssetClicked ||
    (item => {
      openPreview({ item: { id: item.id, type: 'asset' } });
    });
  const onFileClickedCallback =
    onFileClicked ||
    (item => {
      openPreview({ item: { id: item.id, type: 'file' } });
    });
  const onTimeseriesClickedCallback =
    onTimeseriesClicked ||
    (item => {
      openPreview({ item: { id: item.id, type: 'timeSeries' } });
    });
  const onEventClickedCallback =
    onEventClicked ||
    (item => {
      openPreview({ item: { id: item.id, type: 'event' } });
    });
  const onSequenceClickedCallback =
    onSequenceClicked ||
    (item => {
      openPreview({ item: { id: item.id, type: 'sequence' } });
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
  const { data: files = [] } = useCdfItems<FileInfo>(
    'files',
    fileIds.map(getIdParam),
    { enabled: fileIds && fileIds.length > 0 }
  );

  const assetIds = Array.from(categorizedAnnotations.asset.ids);
  const { data: assets = [] } = useCdfItems<Asset>(
    'assets',
    assetIds.map(getIdParam),
    { enabled: assetIds && assetIds.length > 0 }
  );

  const timeseriesIds = Array.from(categorizedAnnotations.timeSeries.ids);
  const { data: timeseries = [] } = useCdfItems<Timeseries>(
    'timeseries',
    timeseriesIds.map(getIdParam),
    { enabled: timeseriesIds && timeseriesIds.length > 0 }
  );

  const eventIds = Array.from(categorizedAnnotations.event.ids);
  const { data: events = [] } = useCdfItems<CogniteEvent>(
    'events',
    eventIds.map(getIdParam),
    { enabled: eventIds && eventIds.length > 0 }
  );

  const sequenceIds = Array.from(categorizedAnnotations.sequence.ids);
  const { data: sequences = [] } = useCdfItems<Sequence>(
    'sequences',
    sequenceIds.map(getIdParam),
    { enabled: sequenceIds && sequenceIds.length > 0 }
  );

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
              {assets.map(asset => {
                return (
                  <FilePreviewOverview.AssetItem
                    onItemClick={() => asset && onAssetClickedCallback(asset)}
                    key={asset.id}
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
              {files.map(linkedFile => {
                return (
                  <FilePreviewOverview.FileItem
                    onItemClick={() => file && onFileClickedCallback(file)}
                    key={linkedFile.id}
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

          {/** Time series */}
          <Collapse.Panel
            showArrow={false}
            key="timeseries"
            header={
              <CollapseHeader>
                <Icon className="cogs-icon resource-icon" type="Timeseries" />
                <Title level={5}>Time series</Title>
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
              {timeseries.map(ts => {
                return (
                  <FilePreviewOverview.TimeseriesItem
                    onItemClick={() => ts && onTimeseriesClickedCallback(ts)}
                    key={ts.id}
                    timeseries={ts}
                    currentPage={page}
                    query={query}
                    annotations={categorizedAnnotations.timeSeries.annotations.filter(
                      el =>
                        ts &&
                        ((el.resourceId && el.resourceId === ts.id) ||
                          (el.resourceExternalId &&
                            el.resourceExternalId === ts.externalId))
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
              {events.map(event => {
                return (
                  <FilePreviewOverview.EventItem
                    onItemClick={() => event && onEventClickedCallback(event)}
                    key={event.id}
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
              {sequences.map(sequence => {
                return (
                  <FilePreviewOverview.SequenceItem
                    onItemClick={() =>
                      sequence && onSequenceClickedCallback(sequence)
                    }
                    key={sequence.id}
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
            Detected resources
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
            File info
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
