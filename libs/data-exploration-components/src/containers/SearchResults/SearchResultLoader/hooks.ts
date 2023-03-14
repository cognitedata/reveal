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

import { transformNewFilterToOldFilter } from '@data-exploration-lib/domain-layer';

type ResourceType = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

const PAGE_SIZE = 50;

// Adding this same as the num of point in Timeseries charts component to easily apply the cache

export const useResourceResults = <T extends ResourceType>(
  api: SdkResourceType,
  query?: string,
  filter?: any,
  limit: number = PAGE_SIZE
  // dateRange: [Date, Date] | undefined = TIME_SELECT['2Y'].getTime(),
  // hideEmptyData?: boolean
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
    enabled: !searchEnabled,
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
      enabled: searchEnabled,
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

  const items = searchEnabled ? searchItems : listItems || [];

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
