import { useState } from 'react';
import { Timeseries } from '@cognite/sdk';
import {
  ResourceItem,
  convertResourceType,
  DateRangeProps,
} from '@data-exploration-components/types';
import { TimeseriesTable } from '@data-exploration-components/containers/Timeseries';

import { RelatedResourceType } from '@data-exploration-components/hooks/RelatedResourcesHooks';

import { Flex, Button } from '@cognite/cogs.js';

import {
  SearchResultCountLabel,
  SearchResultToolbar,
  useResourceResults,
} from '..';

import {
  InternalTimeseriesFilters,
  useTimeseriesAggregateCountQuery,
  useTimeseriesSearchResultWithLabelsQuery,
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
  // TODO Needs refactoring for hiding emppty datasets

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { data, isLoading, isPreviousData, hasNextPage, fetchNextPage } =
    useTimeseriesSearchResultWithLabelsQuery(
      {
        query,
        filter,
        sortBy,
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

  const loadedDataCount = enableAdvancedFilters ? data.length : items.length;
  const totalDataCount = enableAdvancedFilters
    ? countData?.count || 0
    : itemCount;

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
                  loadedCount={loadedDataCount}
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
                  <Button icon="XAxis">Chart preview </Button>
                </RangePicker>
              )}
              <VerticalDivider />
            </Flex>
          </TimeseriesHeaderContainer>
        }
        data={enableAdvancedFilters ? data : items}
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
        onRowClick={(timseries) => onClick(timseries)}
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
