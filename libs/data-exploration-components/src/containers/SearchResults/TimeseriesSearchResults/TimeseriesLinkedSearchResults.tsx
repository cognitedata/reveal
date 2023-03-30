import { Timeseries } from '@cognite/sdk';
import {
  AggregatedFilterV2,
  DateFilterV2,
  MetadataFilterV2,
  TableSortBy,
} from '@data-exploration-components/components';
import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';
import { useTimeseriesList } from '@data-exploration-lib/domain-layer';
import React, { useMemo, useState } from 'react';
import { PreviewFilterDropdown } from '@data-exploration-components/components/PreviewFilter/PreviewFilterDropdown';
import { DefaultPreviewFilter } from '@data-exploration-components/components/PreviewFilter/PreviewFilter';
import { useTimeseriesSearchResultQuery } from '@data-exploration-lib/domain-layer';
import {
  TimeseriesTable,
  useResourceResults,
} from '@data-exploration-components/containers';
import { convertResourceType } from '@data-exploration-components/types';
import { useDebounce } from 'use-debounce';
import {
  InternalCommonFilters,
  InternalTimeseriesFilters,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';

interface Props {
  enableAdvancedFilter?: boolean;
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
  const { items } = useTimeseriesList(filter);

  return (
    <PreviewFilterDropdown>
      <AggregatedFilterV2
        items={items}
        aggregator="unit"
        title="Unit"
        value={filter.unit ? String(filter.unit) : filter.unit}
        setValue={(newValue) => onFilterChange({ unit: newValue })}
      />

      <DateFilterV2
        title="Updated Time"
        value={filter.lastUpdatedTime}
        setValue={(newValue) =>
          onFilterChange({ lastUpdatedTime: newValue || undefined })
        }
      />

      <MetadataFilterV2
        items={items}
        value={filter.metadata}
        setValue={(newValue) => onFilterChange({ metadata: newValue })}
      />
    </PreviewFilterDropdown>
  );
};

export const TimeseriesLinkedSearchResults: React.FC<Props> = ({
  enableAdvancedFilter,
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
  const api = convertResourceType('timeSeries');

  const { canFetchMore, fetchMore, items, isFetched } =
    useResourceResults<Timeseries>(api, debouncedQuery, timeseriesFilters);

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
      { enabled: enableAdvancedFilter },
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
      data={enableAdvancedFilter ? data : items}
      isDataLoading={enableAdvancedFilter ? isLoading : !isFetched}
      enableSorting={enableAdvancedFilter}
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
      hasNextPage={enableAdvancedFilter ? hasNextPage : canFetchMore}
      fetchMore={enableAdvancedFilter ? fetchNextPage : fetchMore}
    />
  );
};
