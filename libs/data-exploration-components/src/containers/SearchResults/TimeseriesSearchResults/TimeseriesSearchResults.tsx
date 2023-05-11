import { useState } from 'react';
import { Asset, Timeseries } from '@cognite/sdk';
import {
  ResourceItem,
  DateRangeProps,
} from '@data-exploration-components/types';
import { TimeseriesTable } from '@data-exploration-components/containers/Timeseries';

import { RelatedResourceType } from '@data-exploration-components/hooks/RelatedResourcesHooks';

import { Flex } from '@cognite/cogs.js';

import {
  TableSortBy,
  useTimeseriesAggregateCountQuery,
  useTimeseriesWithAvailableDatapointsQuery,
} from '@data-exploration-lib/domain-layer';

import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';
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
  showDatePicker = false,
  ...rest
}: {
  query?: string;
  showCount?: boolean;
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
  const timeseriesSearchConfig =
    useGetSearchConfigFromLocalStorage('timeSeries');

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
      timeseriesSearchConfig
    );

  const { data: countData } = useTimeseriesAggregateCountQuery(
    {
      timeseriesFilters: filter,
      query,
    },
    timeseriesSearchConfig
  );

  const totalDataCount = countData?.count || 0;

  const filteredTimeseries = data.filter((item) => item.hasDatapoints);

  const timeseriesData = hideEmptyData ? filteredTimeseries : data;

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
            loadedCount={data.length}
            totalCount={totalDataCount}
          />
        }
        data={timeseriesData}
        isDataLoading={isLoading}
        fetchMore={fetchNextPage}
        hasNextPage={!isPreviousData && hasNextPage}
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
        enableSorting
        sorting={sortBy}
        onSort={setSortBy}
        relatedResourceType={relatedResourceType}
        {...rest}
      />
    </>
  );
};
