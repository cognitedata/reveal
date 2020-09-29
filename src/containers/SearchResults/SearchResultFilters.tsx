import React from 'react';
import { ResourceType } from 'types';
import {
  Asset,
  Timeseries,
  CogniteEvent,
  Sequence,
  FileInfo,
} from 'cognite-sdk-v3';
import styled from 'styled-components';
import { useResourcesSelector } from '@cognite/cdf-resources-store';
import { searchSelector as assetsSearchSelector } from '@cognite/cdf-resources-store/dist/assets';
import { searchSelector as filesSearchSelector } from '@cognite/cdf-resources-store/dist/files';
import { searchSelector as eventsSearchSelector } from '@cognite/cdf-resources-store/dist/events';
import { searchSelector as sequencesSearchSelector } from '@cognite/cdf-resources-store/dist/sequences';
import { searchSelector as timeseriesSearchSelector } from '@cognite/cdf-resources-store/dist/timeseries';
import { useResourceFilters, useQuery } from 'context';
import { buildEventsFilterQuery } from 'containers/Events';
import { buildAssetsFilterQuery } from 'containers/Assets';
import { buildSequencesFilterQuery } from 'containers/Sequences';
import { buildFilesFilterQuery, MimeTypeFilter } from 'containers/Files';
import { buildTimeseriesFilterQuery, UnitFilter } from 'containers/Timeseries';
import { MetadataFilter, DataSetFilters } from './Filters';

type FilterRenderFn<T> = (items: T[]) => React.ReactNode;

type AssetFiltersKey = 'metadata' | 'dataset';

const AssetFilters: { [key in AssetFiltersKey]: FilterRenderFn<Asset> } = {
  metadata: items => <MetadataFilter resourceType="asset" items={items} />,
  dataset: () => <DataSetFilters resourceType="asset" />,
};
type TimeseriesFiltersKey = 'metadata' | 'unit' | 'dataset';

const TimeseriesFilters: {
  [key in TimeseriesFiltersKey]: FilterRenderFn<Timeseries>;
} = {
  metadata: items => <MetadataFilter resourceType="timeSeries" items={items} />,
  unit: items => <UnitFilter items={items} />,
  dataset: () => <DataSetFilters resourceType="timeSeries" />,
};
type EventFiltersKey = 'metadata' | 'dataset';

const EventFilters: {
  [key in EventFiltersKey]: FilterRenderFn<CogniteEvent>;
} = {
  metadata: items => <MetadataFilter resourceType="event" items={items} />,
  dataset: () => <DataSetFilters resourceType="event" />,
};
type SequenceFiltersKey = 'metadata' | 'dataset';

const SequenceFilters: {
  [key in SequenceFiltersKey]: FilterRenderFn<Sequence>;
} = {
  metadata: items => <MetadataFilter resourceType="sequence" items={items} />,
  dataset: () => <DataSetFilters resourceType="sequence" />,
};
type FileFiltersKey = 'metadata' | 'mimeType' | 'dataset';

const FileFilters: { [key in FileFiltersKey]: FilterRenderFn<FileInfo> } = {
  metadata: items => <MetadataFilter resourceType="file" items={items} />,
  mimeType: items => <MimeTypeFilter items={items} />,
  dataset: () => <DataSetFilters resourceType="file" />,
};

const ActiveAssetFilters: AssetFiltersKey[] = ['dataset', 'metadata'];
const ActiveEventFilters: EventFiltersKey[] = ['dataset', 'metadata'];
const ActiveTimeseriesFilters: TimeseriesFiltersKey[] = [
  'unit',
  'dataset',
  'metadata',
];
const ActiveFileFilters: FileFiltersKey[] = ['dataset', 'mimeType', 'metadata'];
const ActiveSequenceFilters: SequenceFiltersKey[] = ['dataset', 'metadata'];

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
  const [query] = useQuery();

  const { items: assets } = useResourcesSelector(assetsSearchSelector)(
    buildAssetsFilterQuery(assetFilter, query)
  );
  const { items: sequences } = useResourcesSelector(sequencesSearchSelector)(
    buildSequencesFilterQuery(sequenceFilter, query)
  );
  const { items: events } = useResourcesSelector(eventsSearchSelector)(
    buildEventsFilterQuery(eventFilter, query)
  );
  const { items: files } = useResourcesSelector(filesSearchSelector)(
    buildFilesFilterQuery(fileFilter, query)
  );
  const { items: timeseries } = useResourcesSelector(timeseriesSearchSelector)(
    buildTimeseriesFilterQuery(timeseriesFilter, query)
  );

  return (
    <>
      {(() => {
        switch (currentResourceType) {
          case 'asset': {
            return ActiveAssetFilters.map(key => (
              <FormItem key={`asset-${key}`}>
                {AssetFilters[key](assets)}
              </FormItem>
            ));
          }
          case 'event': {
            return ActiveEventFilters.map(key => (
              <FormItem key={`event-${key}`}>
                {EventFilters[key](events)}
              </FormItem>
            ));
          }
          case 'timeSeries': {
            return ActiveTimeseriesFilters.map(key => (
              <FormItem key={`timeseries-${key}`}>
                {TimeseriesFilters[key](timeseries)}
              </FormItem>
            ));
          }
          case 'file': {
            return ActiveFileFilters.map(key => (
              <FormItem key={`file-${key}`}>{FileFilters[key](files)}</FormItem>
            ));
          }
          case 'sequence': {
            return ActiveSequenceFilters.map(key => (
              <FormItem key={`sequence-${key}`}>
                {SequenceFilters[key](sequences)}
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
