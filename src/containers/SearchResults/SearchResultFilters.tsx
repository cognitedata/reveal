import React, { useMemo } from 'react';
import { ResourceType } from 'types';
import {
  Asset,
  Timeseries,
  CogniteEvent,
  Sequence,
  FileInfo,
} from '@cognite/sdk';
import styled from 'styled-components';
import { useResourceFilters } from 'context';
import { DirectoryPrefixFilter, MimeTypeFilter } from 'containers/Files';
import { UnitFilter } from 'containers/Timeseries';
import { SdkResourceType, useList } from 'hooks/sdk';
import {
  MetadataFilter,
  DataSetFilter,
  LabelFilter,
  ExternalIDPrefixFilter,
} from './Filters';

type FilterRenderFn<T> = (items: T[]) => React.ReactNode;

type AssetFiltersKey = 'metadata' | 'dataset' | 'label' | 'externalId';

const AssetFilters: { [key in AssetFiltersKey]: FilterRenderFn<Asset> } = {
  metadata: items => <MetadataFilter resourceType="asset" items={items} />,
  dataset: () => <DataSetFilter resourceType="asset" />,
  label: () => <LabelFilter resourceType="asset" />,
  externalId: () => <ExternalIDPrefixFilter resourceType="asset" />,
};
type TimeseriesFiltersKey = 'metadata' | 'unit' | 'dataset' | 'externalId';

const TimeseriesFilters: {
  [key in TimeseriesFiltersKey]: FilterRenderFn<Timeseries>;
} = {
  metadata: items => <MetadataFilter resourceType="timeSeries" items={items} />,
  unit: items => <UnitFilter items={items} />,
  dataset: () => <DataSetFilter resourceType="timeSeries" />,
  externalId: () => <ExternalIDPrefixFilter resourceType="timeSeries" />,
};
type EventFiltersKey = 'metadata' | 'dataset' | 'externalId';

const EventFilters: {
  [key in EventFiltersKey]: FilterRenderFn<CogniteEvent>;
} = {
  metadata: items => <MetadataFilter resourceType="event" items={items} />,
  dataset: () => <DataSetFilter resourceType="event" />,
  externalId: () => <ExternalIDPrefixFilter resourceType="event" />,
};
type SequenceFiltersKey = 'metadata' | 'dataset' | 'externalId';

const SequenceFilters: {
  [key in SequenceFiltersKey]: FilterRenderFn<Sequence>;
} = {
  metadata: items => <MetadataFilter resourceType="sequence" items={items} />,
  dataset: () => <DataSetFilter resourceType="sequence" />,
  externalId: () => <ExternalIDPrefixFilter resourceType="sequence" />,
};
type FileFiltersKey =
  | 'metadata'
  | 'mimeType'
  | 'dataset'
  | 'directory'
  | 'label'
  | 'externalId';

const FileFilters: { [key in FileFiltersKey]: FilterRenderFn<FileInfo> } = {
  metadata: items => <MetadataFilter resourceType="file" items={items} />,
  mimeType: items => <MimeTypeFilter items={items} />,
  directory: () => <DirectoryPrefixFilter />,
  dataset: () => <DataSetFilter resourceType="file" />,
  label: () => <LabelFilter resourceType="file" />,
  externalId: () => <ExternalIDPrefixFilter resourceType="file" />,
};

const ActiveAssetFilters: AssetFiltersKey[] = [
  'label',
  'dataset',
  'externalId',
  'metadata',
];
const ActiveEventFilters: EventFiltersKey[] = [
  'dataset',
  'externalId',
  'metadata',
];
const ActiveTimeseriesFilters: TimeseriesFiltersKey[] = [
  'unit',
  'dataset',
  'externalId',
  'metadata',
];
const ActiveFileFilters: FileFiltersKey[] = [
  'label',
  'dataset',
  'mimeType',
  'externalId',
  'directory',
  'metadata',
];
const ActiveSequenceFilters: SequenceFiltersKey[] = [
  'dataset',
  'externalId',
  'metadata',
];

export const SearchResultFilters = ({
  currentResourceType,
}: {
  currentResourceType: ResourceType;
}) => {
  const {
    eventFilter,
    assetFilter,
    sequenceFilter,
    fileFilter,
    timeseriesFilter,
  } = useResourceFilters();

  const [type, filter] = useMemo<[SdkResourceType, any]>(() => {
    switch (currentResourceType) {
      case 'file':
        return ['files', fileFilter];
      case 'sequence':
        return ['sequences', sequenceFilter];
      case 'timeSeries':
        return ['timeseries', timeseriesFilter];
      case 'event':
        return ['events', eventFilter];
      default:
        return ['assets', assetFilter];
    }
  }, [
    currentResourceType,
    eventFilter,
    assetFilter,
    sequenceFilter,
    fileFilter,
    timeseriesFilter,
  ]);

  const { data: items = [] } = useList(type, { filter, limit: 1000 });

  return (
    <>
      {(() => {
        switch (currentResourceType) {
          case 'asset': {
            return ActiveAssetFilters.map(key => (
              <FormItem key={`asset-${key}`}>
                {AssetFilters[key](items as Asset[])}
              </FormItem>
            ));
          }
          case 'event': {
            return ActiveEventFilters.map(key => (
              <FormItem key={`event-${key}`}>
                {EventFilters[key](items as CogniteEvent[])}
              </FormItem>
            ));
          }
          case 'timeSeries': {
            return ActiveTimeseriesFilters.map(key => (
              <FormItem key={`timeseries-${key}`}>
                {TimeseriesFilters[key](items as Timeseries[])}
              </FormItem>
            ));
          }
          case 'file': {
            return ActiveFileFilters.map(key => (
              <FormItem key={`file-${key}`}>
                {FileFilters[key](items as FileInfo[])}
              </FormItem>
            ));
          }
          case 'sequence': {
            return ActiveSequenceFilters.map(key => (
              <FormItem key={`sequence-${key}`}>
                {SequenceFilters[key](items as Sequence[])}
              </FormItem>
            ));
          }
        }
        return [];
      })()}
    </>
  );
};

export const FormItem = styled.div`
  margin-bottom: 12px;
  .title {
    margin-bottom: 12px;
  }
`;
