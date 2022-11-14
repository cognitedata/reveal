import React, { useState } from 'react';
import { Timeseries } from '@cognite/sdk';
import { ResourceItem, convertResourceType } from 'types';
import { TimeseriesNewTable } from 'containers/Timeseries';

import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';

import { Flex, Loader } from '@cognite/cogs.js';

import { SearchResultToolbar, useResourceResults } from '..';
import { ColumnToggleProps } from 'components/ReactTable';
import {
  InternalTimeseriesFilters,
  useTimeseriesSearchResultQuery,
} from 'domain/timeseries';
import { TableSortBy } from 'components/ReactTable/V2';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';

export const TimeseriesSearchResults = ({
  query = '',
  filter = {},
  showCount = false,
  count,
  onClick,
  onFilterChange,
  relatedResourceType,
  enableAdvancedFilters,
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
  count?: number;
  showDatePicker?: boolean;
  onClick: (item: Timeseries) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
} & ColumnToggleProps<Timeseries>) => {
  const api = convertResourceType('timeSeries');

  const { canFetchMore, fetchMore, isFetched, items } =
    useResourceResults<Timeseries>(api, query, filter);
  // TODO Needs refactoring for hiding emppty datasets

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { data, isLoading, hasNextPage, fetchNextPage } =
    useTimeseriesSearchResultQuery({
      query,
      filter,
      sortBy,
    });

  const loading = enableAdvancedFilters ? isLoading : !isFetched;
  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center"></Flex>

      <TimeseriesNewTable
        id="timeseries-search-results"
        tableHeaders={
          <SearchResultToolbar
            showCount={showCount}
            api={query?.length > 0 ? 'search' : 'list'}
            type="timeSeries"
            filter={filter}
            count={count}
            query={query}
          />
        }
        sorting={sortBy}
        data={enableAdvancedFilters ? data : items}
        fetchMore={enableAdvancedFilters ? fetchNextPage : fetchMore}
        hasNextPage={enableAdvancedFilters ? hasNextPage : canFetchMore}
        tableSubHeaders={
          <AppliedFiltersTags filter={filter} onFilterChange={onFilterChange} />
        }
        showLoadButton
        onRowClick={timseries => onClick(timseries)}
        enableSorting
        onSort={setSortBy}
        relatedResourceType={relatedResourceType}
        {...rest}
      />
    </>
  );
};
