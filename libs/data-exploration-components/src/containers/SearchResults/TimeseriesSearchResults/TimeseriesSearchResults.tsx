import { useState } from 'react';
import { Asset, Timeseries } from '@cognite/sdk';
import {
  ResourceItem,
  convertResourceType,
  DateRangeProps,
} from '@data-exploration-components/types';
import { TimeseriesTable } from '@data-exploration-components/containers/Timeseries';

import { RelatedResourceType } from '@data-exploration-components/hooks/RelatedResourcesHooks';

import { Flex, Button, Tooltip } from '@cognite/cogs.js';

import {
  SearchResultCountLabel,
  SearchResultToolbar,
  useResourceResults,
} from '..';

import {
  InternalTimeseriesFilters,
  useTimeseriesAggregateCountQuery,
  useTimeseriesWithDatapointsAvailabliity,
} from '@data-exploration-lib/domain-layer';
import { TableSortBy } from '@data-exploration-components/components/Table';
import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';
import {
  RangePicker,
  useResultCount,
} from '@data-exploration-components/components';
import styled from 'styled-components';
import { VerticalDivider } from '@data-exploration-components/components/Divider';

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
  const { canFetchMore, fetchMore, isFetched, items } =
    useResourceResults<Timeseries>(api, query, filter);
  const { count: itemCount } = useResultCount({
    type: 'timeSeries',
    filter,
    query,
    api: query && query.length > 0 ? 'search' : 'list',
  });

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const [hideEmptyData, setHideEmptyData] = useState(false);
  const { data, isLoading, isPreviousData, hasNextPage, fetchNextPage } =
    useTimeseriesWithDatapointsAvailabliity(
      {
        query,
        filter,
        sortBy,
        dateRange,
      },
      { enabled: enableAdvancedFilters }
    );

  const { data: countData } = useTimeseriesAggregateCountQuery(
    {
      timeseriesFilters: filter,
      query,
    },
    { enabled: enableAdvancedFilters }
  );

  const totalDataCount = enableAdvancedFilters
    ? countData?.count || 0
    : itemCount;
  const timeseries = enableAdvancedFilters ? data : items;

  const filteredTimeseries = data.filter((item) => item.hasDatapoints);

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
          <TimeseriesHeaderContainer
            alignItems="center"
            justifyContent="space-between"
          >
            <SearchResultToolbar
              type="timeSeries"
              showCount={showCount}
              resultCount={
                <SearchResultCountLabel
                  loadedCount={timeseries.length}
                  totalCount={totalDataCount}
                  resourceType="timeSeries"
                />
              }
            />
            <Flex alignItems="center" gap={10}>
              {showDatePicker && (
                <RangePicker
                  initialRange={dateRange}
                  onRangeChanged={onDateRangeChange}
                >
                  <Button icon="XAxis" aria-label="Chart Preview logo">
                    Chart preview{' '}
                  </Button>
                </RangePicker>
              )}
              <Tooltip
                content="All loaded timeseries are empty. Button will be enabled when at least 1 timeseries has datapoints"
                disabled={filteredTimeseries.length !== 0}
              >
                <Button
                  toggled={hideEmptyData}
                  disabled={filteredTimeseries.length === 0}
                  onClick={() => setHideEmptyData((prev) => !prev)}
                >
                  Hide empty timeseries
                </Button>
              </Tooltip>

              <VerticalDivider />
            </Flex>
          </TimeseriesHeaderContainer>
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

const TimeseriesHeaderContainer = styled(Flex)`
  flex: 1;
`;
