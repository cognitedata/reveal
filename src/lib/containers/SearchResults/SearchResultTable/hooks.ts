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

type ResourceType = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

const PAGE_SIZE = 50;

export const useResourceResults = <T extends ResourceType>(
  api: SdkResourceType,
  query?: string,
  filter?: any
) => {
  const searchEnabled = !!query && query.length > 0;

  const {
    data: listData,
    isFetched: listFetched,
    canFetchMore: listCanFetchMore,
    isFetchingMore: listIsFetchingMore,
    fetchMore: listFetchMore,
    isFetching: isFetchingList,
  } = useInfiniteList<T>(api, PAGE_SIZE, filter, {
    enabled: !searchEnabled,
  });
  const listItems = useMemo(
    () => listData?.reduce((accl, t) => accl.concat(t.items), [] as T[]),
    [listData]
  );

  const {
    data: searchData,
    isFetched: searchFetched,
    isFetching: isSearching,
    isFetchingMore: searchIsFetchingMore,
    fetchMore: searchFetchMore,
    canFetchMore: searchCanFetchMore,
  } = useInfiniteSearch<T>(
    api,
    query!,
    PAGE_SIZE,
    Object.keys(filter).length > 0 ? filter : undefined,
    {
      enabled: searchEnabled,
    }
  );
  const searchItems = useMemo(() => flatten(searchData), [searchData]);

  const isFetched = searchEnabled ? searchFetched : listFetched;
  const isFetching = searchEnabled ? isSearching : isFetchingList;
  const fetchMore = searchEnabled ? searchFetchMore : listFetchMore;
  const isFetchingMore = searchEnabled
    ? searchIsFetchingMore
    : listIsFetchingMore;
  const canFetchMore = searchEnabled ? searchCanFetchMore : listCanFetchMore;
  const items = searchEnabled ? searchItems : listItems;

  return {
    canFetchMore,
    fetchMore,
    isFetchingMore,
    isFetched,
    isFetching,
    items,
    searchEnabled,
  };
};
