import React from 'react';
import { Timeseries } from '@cognite/sdk';
import { ResourceItem, convertResourceType } from 'types';
import { TimeseriesNewTable } from 'containers/Timeseries';
import { EnsureNonEmptyResource } from 'components';

import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';

import { Flex, Loader } from '@cognite/cogs.js';

import { SearchResultToolbar, useResourceResults } from '..';
import { ColumnToggleProps } from 'components/ReactTable';
import { InternalTimeseriesFilters } from 'domain/timeseries';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';

export const TimeseriesSearchResults = ({
  query = '',
  filter = {},
  showCount = false,
  count,
  onClick,
  onFilterChange,
  relatedResourceType,
  ...rest
}: {
  query?: string;
  showCount?: boolean;
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

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <>
      <EnsureNonEmptyResource api="timeSeries">
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
          tableSubHeaders={
            <AppliedFiltersTags
              filter={filter}
              onFilterChange={onFilterChange}
            />
          }
          data={items}
          fetchMore={fetchMore}
          showLoadButton
          hasNextPage={canFetchMore}
          onRowClick={timseries => onClick(timseries)}
          relatedResourceType={relatedResourceType}
          {...rest}
        />
      </EnsureNonEmptyResource>
    </>
  );
};
