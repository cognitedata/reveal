import React, { useMemo } from 'react';
import { ResourceType } from 'lib/types';
import { Colors } from '@cognite/cogs.js';
import {
  Asset,
  Timeseries,
  CogniteEvent,
  Sequence,
  FileInfo,
} from '@cognite/sdk';
import styled from 'styled-components';
import { useResourceFilters } from 'lib/context';
import {
  DirectoryPrefixFilter,
  MimeTypeFilter,
  UploadedFilter,
} from 'lib/containers/Files';
import {
  IsStepFilter,
  IsStringFilter,
  UnitFilter,
} from 'lib/containers/Timeseries';
import { SdkResourceType, useList } from '@cognite/sdk-react-query-hooks';
import { SubtreeFilter } from 'lib/containers/Assets';
import { EventSubTypeFilter, EventTypeFilter } from 'lib/containers/Events';

import { SourceFilter } from './SourceFilter/SourceFilter';
import { LabelFilter } from './LabelFilter/LabelFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { ExternalIDPrefixFilter } from './ExternalIDPrefixFilter/ExternalIDPrefixFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';

type FilterRenderFn<T> = (items: T[]) => React.ReactNode;

type AssetFiltersKey =
  | 'metadata'
  | 'dataset'
  | 'label'
  | 'externalId'
  | 'subtree'
  | 'source';

const AssetFilters: { [key in AssetFiltersKey]: FilterRenderFn<Asset> } = {
  metadata: items => <MetadataFilter resourceType="asset" items={items} />,
  dataset: () => <DataSetFilter resourceType="asset" />,
  label: () => <LabelFilter resourceType="asset" />,
  externalId: () => <ExternalIDPrefixFilter resourceType="asset" />,
  subtree: () => <SubtreeFilter />,
  source: items => <SourceFilter resourceType="asset" items={items} />,
};
type TimeseriesFiltersKey =
  | 'metadata'
  | 'unit'
  | 'dataset'
  | 'externalId'
  | 'isString'
  | 'asset'
  | 'isStep';

const TimeseriesFilters: {
  [key in TimeseriesFiltersKey]: FilterRenderFn<Timeseries>;
} = {
  metadata: items => <MetadataFilter resourceType="timeSeries" items={items} />,
  unit: items => <UnitFilter items={items} />,
  isString: () => <IsStringFilter />,
  isStep: () => <IsStepFilter />,
  dataset: () => <DataSetFilter resourceType="timeSeries" />,
  externalId: () => <ExternalIDPrefixFilter resourceType="timeSeries" />,
  asset: () => <ByAssetFilter resourceType="timeSeries" />,
};
type EventFiltersKey =
  | 'metadata'
  | 'dataset'
  | 'source'
  | 'type'
  | 'subtype'
  | 'asset'
  | 'externalId';

const EventFilters: {
  [key in EventFiltersKey]: FilterRenderFn<CogniteEvent>;
} = {
  metadata: items => <MetadataFilter resourceType="event" items={items} />,
  source: items => <SourceFilter resourceType="event" items={items} />,
  type: items => <EventTypeFilter items={items} />,
  subtype: items => <EventSubTypeFilter items={items} />,
  dataset: () => <DataSetFilter resourceType="event" />,
  externalId: () => <ExternalIDPrefixFilter resourceType="event" />,
  asset: () => <ByAssetFilter resourceType="event" />,
};
type SequenceFiltersKey = 'metadata' | 'dataset' | 'externalId' | 'asset';

const SequenceFilters: {
  [key in SequenceFiltersKey]: FilterRenderFn<Sequence>;
} = {
  metadata: items => <MetadataFilter resourceType="sequence" items={items} />,
  dataset: () => <DataSetFilter resourceType="sequence" />,
  externalId: () => <ExternalIDPrefixFilter resourceType="sequence" />,
  asset: () => <ByAssetFilter resourceType="sequence" />,
};
type FileFiltersKey =
  | 'metadata'
  | 'mimeType'
  | 'dataset'
  | 'uploaded'
  | 'directory'
  | 'label'
  | 'source'
  | 'asset'
  | 'externalId';

const FileFilters: { [key in FileFiltersKey]: FilterRenderFn<FileInfo> } = {
  metadata: items => <MetadataFilter resourceType="file" items={items} />,
  mimeType: items => <MimeTypeFilter items={items} />,
  uploaded: () => <UploadedFilter />,
  source: items => <SourceFilter resourceType="file" items={items} />,
  directory: () => <DirectoryPrefixFilter />,
  dataset: () => <DataSetFilter resourceType="file" />,
  label: () => <LabelFilter resourceType="file" />,
  externalId: () => <ExternalIDPrefixFilter resourceType="file" />,
  asset: () => <ByAssetFilter resourceType="file" />,
};

const ActiveAssetFilters: AssetFiltersKey[] = [
  'label',
  'dataset',
  'source',
  'externalId',
  'subtree',
  'metadata',
];
const ActiveEventFilters: EventFiltersKey[] = [
  'dataset',
  'type',
  'subtype',
  'asset',
  'externalId',
  'source',
  'metadata',
];
const ActiveTimeseriesFilters: TimeseriesFiltersKey[] = [
  'unit',
  'dataset',
  'asset',
  'isString',
  'isStep',
  'externalId',
  'metadata',
];
const ActiveFileFilters: FileFiltersKey[] = [
  'label',
  'dataset',
  'mimeType',
  'asset',
  'uploaded',
  'externalId',
  'directory',
  'source',
  'metadata',
];
const ActiveSequenceFilters: SequenceFiltersKey[] = [
  'dataset',
  'externalId',
  'asset',
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

  const FilterWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 260px;
    margin-top: 16px;
    padding-right: 16px;
    border-right: 1px solid ${Colors['greyscale-grey3'].hex()};
    overflow-x: visible;
    overflow-y: auto;
  `;

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
    <FilterWrapper>
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
    </FilterWrapper>
  );
};

export const FormItem = styled.div`
  margin-bottom: 12px;
  .title {
    margin-bottom: 12px;
  }
`;
