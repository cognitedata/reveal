import React from 'react';
import { FileFilterProps } from '@cognite/cdf-sdk-singleton';
import { AssetSelectFilter } from './Filters/AssetSelectFilter';
import { DateFilter } from './Filters/DateFilter';
import { DataSetSelectFilter } from './Filters/DataSetSelectFilter';
import { SelectLabelsFilter } from './Filters/SelectLabelsFilter';
import { MetadataSelectFilter } from './Filters/MetadataSelectFilter';
import { ExternalIdFilter } from './Filters/ExternalIDFilter';

export type FilterPanelConfigItem = {
  key: string;
  headerText: string;
  disableClear: boolean;
  clear: () => void;
  filterItem: JSX.Element;
};

export const getFilterPanelItems = (
  filter: FileFilterProps,
  setFilter: (newFilter: FileFilterProps) => void
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
];
