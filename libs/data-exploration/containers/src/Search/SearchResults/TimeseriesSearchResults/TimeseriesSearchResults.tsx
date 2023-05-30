import { useState } from 'react';

import { TableProps } from '@data-exploration/components';

import { Flex } from '@cognite/cogs.js';
import { Asset, Timeseries } from '@cognite/sdk';

import {
  InternalTimeseriesFilters,
  useGetSearchConfigFromLocalStorage,
  DateRangeProps,
} from '@data-exploration-lib/core';
import {
  TableSortBy,
  useTimeseriesAggregateCountQuery,
  useTimeseriesWithAvailableDatapointsQuery,
} from '@data-exploration-lib/domain-layer';

import { AppliedFiltersTags } from '../AppliedFiltersTags';

import { TimeseriesTable } from './TimeseriesTable';
import { TimeseriesTableHeader } from './TimeseriesTableHeader';

export const TimeseriesSearchResults = ({
  query = '',
  filter = {},
  showCount = false,
  onClick,
  onRootAssetClick,
  dateRange,
  id,
  onDateRangeChange,
  onFilterChange,
  selectedRow,
  showDatePicker = false,
  ...rest
}: {
  query?: string;
  showCount?: boolean;
  id?: string;
  initialView?: string;
  filter?: InternalTimeseriesFilters;
  selectedRow?: Record<string | number, boolean>;
  showDatePicker?: boolean;
  onClick: (item: Timeseries) => void;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
} & DateRangeProps &
  Omit<TableProps<Timeseries>, 'data' | 'columns' | 'id'>) => {
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
        id={id || 'timeseries-search-results'}
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
        {...rest}
      />
    </>
  );
};
