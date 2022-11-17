import React, { useState } from 'react';
import { Timeseries } from '@cognite/sdk';
import { ResourceItem, convertResourceType } from 'types';
import { TimeseriesTable } from 'containers/Timeseries';

import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';

import { Flex, Loader } from '@cognite/cogs.js';

import { SearchResultToolbar, useResourceResults } from '..';

import {
  InternalTimeseriesFilters,
  useTimeseriesSearchResultQuery,
} from 'domain/timeseries';
import { TableSortBy } from 'components/Table';
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
}) => {
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

      <TimeseriesTable
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
        data={enableAdvancedFilters ? data : items}
        fetchMore={enableAdvancedFilters ? fetchNextPage : fetchMore}
        hasNextPage={enableAdvancedFilters ? hasNextPage : canFetchMore}
        tableSubHeaders={
          <AppliedFiltersTags
            filter={filter}
            onFilterChange={onFilterChange}
            icon="Timeseries"
          />
        }
        showLoadButton
        onRowClick={timseries => onClick(timseries)}
        enableSorting
        sorting={sortBy}
        onSort={setSortBy}
        relatedResourceType={relatedResourceType}
        {...rest}
      />
    </>
  );
};
