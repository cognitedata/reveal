import { useMemo } from 'react';

import flatten from 'lodash/flatten';

import {
  FileInfo,
  Asset,
  CogniteEvent,
  Sequence,
  Timeseries,
} from '@cognite/sdk';
import {
  useInfiniteList,
  useInfiniteSearch,
  SdkResourceType,
} from '@cognite/sdk-react-query-hooks';

import { isDateInDateRange } from '@data-exploration-lib/core';
import {
  transformNewFilterToOldFilter,
  useTimeseriesWithDatapointsQuery,
} from '@data-exploration-lib/domain-layer';

type ResourceType = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

const PAGE_SIZE = 50;

// Adding this same as the num of point in Timeseries charts component to easily apply the cache

export const useResourceResults = <T extends ResourceType>(
  api: SdkResourceType,
  query?: string,
  filter?: any,
  limit: number = PAGE_SIZE,
  dateRange?: [Date, Date],
  enabled: boolean = true
) => {
  const searchEnabled = !!query && query.length > 0;

  filter = transformNewFilterToOldFilter(filter);

  const {
    data: listData,
    isLoading: isLoadingList,
    isFetched: listFetched,
    hasNextPage: listCanFetchMore,
    isFetchingNextPage: listIsFetchingMore,
    fetchNextPage: listFetchMore,
    isFetching: isFetchingList,
  } = useInfiniteList<T>(api, limit, filter, {
    enabled: !searchEnabled && enabled,
  });
  const listItems = useMemo(
    () => listData?.pages?.reduce((accl, t) => accl.concat(t.items), [] as T[]),
    [listData]
  );

  const {
    data: searchData,
    isLoading: isLoadingSearch,
    isFetched: searchFetched,
    isFetching: isSearching,
    isFetchingNextPage: searchIsFetchingMore,
    fetchNextPage: searchFetchMore,
    hasNextPage: searchCanFetchMore,
  } = useInfiniteSearch<T>(
    api,
    query!,
    limit,
    Object.keys(filter).length > 0 ? filter : undefined,
    {
      enabled: searchEnabled && enabled,
    }
  );
  const searchItems = useMemo(() => flatten(searchData?.pages), [searchData]);

  const isFetched = searchEnabled ? searchFetched : listFetched;
  const isLoading = searchEnabled ? isLoadingSearch : isLoadingList;
  const isFetching = searchEnabled ? isSearching : isFetchingList;
  const fetchMore = searchEnabled ? searchFetchMore : listFetchMore;
  const isFetchingMore = searchEnabled
    ? searchIsFetchingMore
    : listIsFetchingMore;
  const canFetchMore = searchEnabled ? searchCanFetchMore : listCanFetchMore;

  const fetchedItems = searchEnabled ? searchItems : listItems || [];
  // INFO: This is to add 2 additional fields(hasDatapoints, latestDatapointDate) to the timeseries data.
  const items = useTimeseriesWithDatapoints(api, fetchedItems, dateRange);

  const result = {
    canFetchMore,
    fetchMore,
    isFetchingMore,
    isFetched,
    isFetching,
    isLoading,
    items,
    searchEnabled,
  };

  return result;
};

const useTimeseriesWithDatapoints = <T extends ResourceType>(
  api: SdkResourceType,
  timeseries: T[],
  dateRange?: [Date, Date]
) => {
  const isTimeseries = api === 'timeseries';

  // We need end date from dateRange to see if the range has any datapoints.
  const { data: timeseriesWithDataPointMap } = useTimeseriesWithDatapointsQuery(
    timeseries.map((item) => item.id),
    dateRange ? dateRange[1] : undefined,
    isTimeseries
  );

  // We do not care about the dateRange to show the date of latest datapoints since backend uses 'now' as default before date.
  const { data: timeseriesWithLatestDataPointMap } =
    useTimeseriesWithDatapointsQuery(
      timeseries.map((item) => item.id),
      undefined,
      isTimeseries
    );

  if (isTimeseries) {
    return timeseries.map((item) => ({
      ...item,
      hasDatapoints: isDateInDateRange(
        timeseriesWithDataPointMap[item.id],
        dateRange
      ),
      latestDatapointDate: timeseriesWithLatestDataPointMap[item.id],
    }));
  }

  return timeseries;
};
