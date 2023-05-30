import React, { useMemo, useState } from 'react';

import {
  DefaultPreviewFilter,
  PreviewFilterDropdown,
} from '@data-exploration/components';
import { useDebounce } from 'use-debounce';

import { Timeseries } from '@cognite/sdk';

import {
  InternalCommonFilters,
  InternalTimeseriesFilters,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';
import {
  TableSortBy,
  useTimeseriesSearchResultQuery,
} from '@data-exploration-lib/domain-layer';

import { UnitFilter, DateFilter, MetadataFilter } from '../../../Filters';
import { AppliedFiltersTags } from '../AppliedFiltersTags';

import { TimeseriesTable } from './TimeseriesTable';

interface Props {
  defaultFilter: InternalCommonFilters;
  onClick: (item: Timeseries) => void;
  onParentAssetClick: (assetId: number) => void;
}

const LinkedAssetFilter = ({
  filter,
  onFilterChange,
}: {
  filter: InternalTimeseriesFilters;
  onFilterChange: (newValue: InternalTimeseriesFilters) => void;
}) => {
  return (
    <PreviewFilterDropdown>
      <UnitFilter.Timeseries
        filter={filter}
        value={filter.unit}
        onChange={(newUnit) => onFilterChange({ unit: newUnit })}
      />

      <DateFilter.Updated
        value={filter.lastUpdatedTime}
        onChange={(newValue) =>
          onFilterChange({
            lastUpdatedTime: newValue || undefined,
          })
        }
      />
      <MetadataFilter.Timeseries
        filter={filter}
        values={filter.metadata}
        onChange={(newMetadata) => {
          onFilterChange({ metadata: newMetadata });
        }}
      />
    </PreviewFilterDropdown>
  );
};

export const TimeseriesLinkedSearchResults: React.FC<Props> = ({
  defaultFilter,
  onClick,
  onParentAssetClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [filter, setFilter] = useState<InternalTimeseriesFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const timeseriesSearchConfig =
    useGetSearchConfigFromLocalStorage('timeSeries');

  const timeseriesFilters = useMemo(() => {
    return {
      ...filter,
      ...defaultFilter,
    };
  }, [filter, defaultFilter]);

  const handleFilterChange = (newValue: InternalTimeseriesFilters) => {
    setFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  const { data, hasNextPage, fetchNextPage, isLoading } =
    useTimeseriesSearchResultQuery(
      {
        query: debouncedQuery,
        filter: timeseriesFilters,
        sortBy,
      },
      timeseriesSearchConfig
    );

  const appliedFilters = { ...filter, assetSubtreeIds: undefined };

  return (
    <TimeseriesTable
      id="timeseries-linked-search-results"
      query={debouncedQuery}
      onRowClick={(asset) => onClick(asset)}
      onRootAssetClick={(directAsset) => {
        onParentAssetClick(directAsset.id);
      }}
      data={data}
      isDataLoading={isLoading}
      enableSorting
      sorting={sortBy}
      onSort={(props) => setSortBy(props)}
      showLoadButton
      tableSubHeaders={
        <AppliedFiltersTags
          filter={appliedFilters}
          onFilterChange={handleFilterChange}
        />
      }
      tableHeaders={
        <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
          <LinkedAssetFilter
            filter={timeseriesFilters}
            onFilterChange={handleFilterChange}
          />
        </DefaultPreviewFilter>
      }
      hasNextPage={hasNextPage}
      fetchMore={fetchNextPage}
    />
  );
};
