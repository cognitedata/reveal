import React from 'react';
import { DirectoryPrefixesProvider } from 'src/modules/Explorer/Containers/DirectoryPrefixesProvider';
import { AssetSelectFilter } from './Filters/AssetSelectFilter';
import { DateFilter } from './Filters/DateFilter';
import { DataSetSelectFilter } from './Filters/DataSetSelectFilter';
import { SelectLabelsFilter } from './Filters/SelectLabelsFilter';
import { MetadataSelectFilter } from './Filters/MetadataSelectFilter';
import { ExternalIdFilter } from './Filters/ExternalIDFilter';
import { DirectoryPrefixFilter } from './Filters/DirectoryPrefixFilter';
import { AnnotationFilter } from './Filters/AnnotationFilter';
import { VisionFileFilterProps } from './Filters/types';

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
    key: '2',
    headerText: 'Directory Prefix',
    disableClear: !(filter as any).directoryPrefix,
    clear: () => {
      setFilter({
        ...filter,
        // @ts-ignore
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
    key: '3',
    headerText: 'Asset',
    disableClear: !filter.assetIds,
    clear: () => {
      setFilter({
        ...filter,
        assetIds: undefined,
      });
    },
    filterItem: <AssetSelectFilter filter={filter} setFilter={setFilter} />,
  },
  {
    key: '4',
    headerText: 'Date',
    disableClear: !filter.createdTime,
    clear: () => {
      setFilter({
        ...filter,
        createdTime: undefined,
        uploadedTime: undefined,
        sourceCreatedTime: undefined,
      });
    },
    filterItem: <DateFilter filter={filter} setFilter={setFilter} />,
  },
  {
    key: '6',
    headerText: 'File data',
    disableClear: !filter.externalIdPrefix && !filter.labels,
    clear: () => {
      setFilter({
        ...filter,
        externalIdPrefix: undefined,
        labels: undefined,
      });
    },
    filterItem: (
      <>
        <ExternalIdFilter filter={filter} setFilter={setFilter} />
        <SelectLabelsFilter filter={filter} setFilter={setFilter} />
      </>
    ),
  },
  {
    key: '7',
    headerText: 'Metadata',
    disableClear: !filter.metadata,
    clear: () => {
      setFilter({
        ...filter,
        metadata: undefined,
      });
    },
    filterItem: <MetadataSelectFilter filter={filter} setFilter={setFilter} />,
  },
  {
    key: '8',
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
];
