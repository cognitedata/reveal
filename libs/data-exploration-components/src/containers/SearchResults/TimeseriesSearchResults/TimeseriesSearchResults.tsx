import { useState } from 'react';
import { Asset, Timeseries } from '@cognite/sdk';
import {
  ResourceItem,
  convertResourceType,
  DateRangeProps,
} from '@data-exploration-components/types';
import { TimeseriesTable } from '@data-exploration-components/containers/Timeseries';

import { RelatedResourceType } from '@data-exploration-components/hooks/RelatedResourcesHooks';

import { Flex } from '@cognite/cogs.js';

import { useResourceResults } from '..';

import {
  InternalTimeseriesData,
  TableSortBy,
  useTimeseriesAggregateCountQuery,
  useTimeseriesWithAvailableDatapointsQuery,
} from '@data-exploration-lib/domain-layer';

import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';
import { useResultCount } from '@data-exploration-components/components';
import {
  InternalTimeseriesFilters,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';
import { TimeseriesTableHeader } from './TimeseriesTableHeader';

export const TimeseriesSearchResults = ({
  query = '',
  filter = {},
  showCount = false,
  onClick,
  onRootAssetClick,
  dateRange,
  onDateRangeChange,
  onFilterChange,
  selectedRow,
  relatedResourceType,
  enableAdvancedFilters,
  showDatePicker = false,
  ...rest
}: {
  query?: string;
  showCount?: boolean;

  enableAdvancedFilters?: boolean;
  initialView?: string;
  filter?: InternalTimeseriesFilters;
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  selectedRow?: Record<string | number, boolean>;
  showDatePicker?: boolean;
  onClick: (item: Timeseries) => void;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
} & DateRangeProps) => {
  const api = convertResourceType('timeSeries');

  const timeseriesSearchConfig =
    useGetSearchConfigFromLocalStorage('timeSeries');

  const { canFetchMore, fetchMore, isFetched, items } =
    useResourceResults<InternalTimeseriesData>(
      api,
      query,
      filter,
      undefined,
      dateRange
    );

  const { count: itemCount } = useResultCount({
    type: 'timeSeries',
    filter,
    query,
    api: query && query.length > 0 ? 'search' : 'list',
  });

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const [hideEmptyData, setHideEmptyData] = useState(false);
  const { data, isLoading, isPreviousData, hasNextPage, fetchNextPage } =
    useTimeseriesWithAvailableDatapointsQuery(
      {
        query,
        filter,
        sortBy,
        dateRange,
      },
      { enabled: enableAdvancedFilters },
      timeseriesSearchConfig
    );

  const { data: countData } = useTimeseriesAggregateCountQuery(
    {
      timeseriesFilters: filter,
      query,
    },
    { enabled: enableAdvancedFilters },
    timeseriesSearchConfig
  );

  const totalDataCount = enableAdvancedFilters
    ? countData?.count || 0
    : itemCount;
  const timeseries = enableAdvancedFilters ? data : items;

  const filteredTimeseries = timeseries.filter((item) => item.hasDatapoints);

  const timeseriesData = hideEmptyData ? filteredTimeseries : timeseries;

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center"></Flex>

      <TimeseriesTable
        id="timeseries-search-results"
        selectedRows={selectedRow}
        query={query}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        tableHeaders={
          <TimeseriesTableHeader
            showCount={showCount}
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            showDatePicker={showDatePicker}
            hideEmptyData={hideEmptyData}
            setHideEmptyData={setHideEmptyData}
            filteredTimeseriesLength={filteredTimeseries.length}
            loadedCount={timeseries.length}
            totalCount={totalDataCount}
          />
        }
        data={timeseriesData}
        isDataLoading={enableAdvancedFilters ? isLoading : !isFetched}
        fetchMore={enableAdvancedFilters ? fetchNextPage : fetchMore}
        hasNextPage={
          enableAdvancedFilters ? !isPreviousData && hasNextPage : canFetchMore
        }
        tableSubHeaders={
          <AppliedFiltersTags
            filter={filter}
            onFilterChange={onFilterChange}
            icon="Timeseries"
          />
        }
        showLoadButton
        onRowClick={(currentTimeseries) => onClick(currentTimeseries)}
        onRootAssetClick={onRootAssetClick}
        enableSorting={enableAdvancedFilters}
        sorting={sortBy}
        onSort={setSortBy}
        relatedResourceType={relatedResourceType}
        {...rest}
      />
    </>
  );
};
