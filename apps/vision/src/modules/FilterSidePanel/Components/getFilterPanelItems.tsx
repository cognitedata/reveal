import React from 'react';

import { DirectoryPrefixesProvider } from '@vision/modules/FilterSidePanel/Containers/DirectoryPrefixesProvider';
import { VisionFileFilterProps } from '@vision/modules/FilterSidePanel/types';

import { AnnotationFilter } from './Filters/AnnotationFilter';
import { AssetSelectFilter } from './Filters/AssetSelectFilter';
import { DataSetSelectFilter } from './Filters/DataSetSelectFilter';
import { DateFilter } from './Filters/DateFilter';
import { DirectoryPrefixFilter } from './Filters/DirectoryPrefixFilter';
import { ExternalIdFilter } from './Filters/ExternalIDFilter';
import { MediaTypeFilter } from './Filters/MediaTypeFilter';
import { MetadataSelectFilter } from './Filters/MetadataSelectFilter';
import { SelectLabelsFilter } from './Filters/SelectLabelsFilter';
import { SourceFilter } from './Filters/SourceFilter';
import { TimeFilter } from './Filters/TimeFilter';

export type FilterPanelConfigItem = {
  key: string;
  headerText: string;
  disableClear: boolean;
  clear: () => void;
  filterItem: JSX.Element;
};

export const getFilterPanelItems = (
  filter: VisionFileFilterProps,
  setFilter: (newFilter: VisionFileFilterProps) => void
): FilterPanelConfigItem[] => [
  {
    key: '1',
    headerText: 'Date and time',
    disableClear:
      !filter.createdTime &&
      !filter.uploadedTime &&
      !filter.sourceCreatedTime &&
      !filter.dateFilter &&
      !filter.timeRange,
    clear: () => {
      setFilter({
        ...filter,
        createdTime: undefined,
        uploadedTime: undefined,
        sourceCreatedTime: undefined,
        dateFilter: undefined,
        timeRange: undefined,
      });
    },
    filterItem: (
      <>
        <DateFilter filter={filter} setFilter={setFilter} />
        <TimeFilter filter={filter} setFilter={setFilter} />
      </>
    ),
  },
  {
    key: '2',
    headerText: 'Asset',
    disableClear: !filter.assetSubtreeIds,
    clear: () => {
      setFilter({
        ...filter,
        assetSubtreeIds: undefined,
      });
    },
    filterItem: <AssetSelectFilter filter={filter} setFilter={setFilter} />,
  },
  {
    key: '3',
    headerText: 'Annotation',
    disableClear: !filter.annotation,
    clear: () => {
      setFilter({
        ...filter,
        annotation: undefined,
      });
    },
    filterItem: <AnnotationFilter filter={filter} setFilter={setFilter} />,
  },
  {
    key: '4',
    headerText: 'Media type',
    disableClear: !filter.mediaType,
    clear: () => {
      setFilter({
        ...filter,
        mediaType: undefined,
      });
    },
    filterItem: <MediaTypeFilter filter={filter} setFilter={setFilter} />,
  },
  {
    key: '5',
    headerText: 'Data set',
    disableClear: !filter.dataSetIds,
    clear: () => {
      setFilter({
        ...filter,
        dataSetIds: undefined,
      });
    },
    filterItem: <DataSetSelectFilter filter={filter} setFilter={setFilter} />,
  },
  {
    key: '6',
    headerText: 'Directory prefix',
    disableClear: !(filter as any).directoryPrefix,
    clear: () => {
      setFilter({
        ...filter,
        directoryPrefix: undefined,
      });
    },
    filterItem: (
      <DirectoryPrefixesProvider>
        {(availablePrefixes) => (
          <DirectoryPrefixFilter
            availablePrefixes={availablePrefixes}
            filter={filter}
            setFilter={setFilter}
          />
        )}
      </DirectoryPrefixesProvider>
    ),
  },
  {
    key: '7',
    headerText: 'Additional filters',
    disableClear:
      !filter.externalIdPrefix &&
      !filter.labels &&
      !filter.metadata &&
      !filter.source,
    clear: () => {
      setFilter({
        ...filter,
        externalIdPrefix: undefined,
        labels: undefined,
        metadata: undefined,
        source: undefined,
      });
    },
    filterItem: (
      <>
        <ExternalIdFilter filter={filter} setFilter={setFilter} />
        <SelectLabelsFilter filter={filter} setFilter={setFilter} />
        <MetadataSelectFilter filter={filter} setFilter={setFilter} />
        <SourceFilter filter={filter} setFilter={setFilter} />
      </>
    ),
  },
];
