import { useMemo } from 'react';
import {
  FileInfo,
  Asset,
  CogniteEvent,
  Sequence,
  Timeseries,
} from '@cognite/sdk';
import { useInfiniteList, useSearch, SdkResourceType } from 'hooks/sdk';

type ResourceType = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

const PAGE_SIZE = 50;

export const useResourceResults = <T extends ResourceType>(
  api: SdkResourceType,
  searchCount?: number,
  query?: string,
  filter?: any
) => {
  const searchEnabled = !!query && query.length > 0;

  const {
    data: listData,
    isFetched: listFetched,
    canFetchMore,
    isFetchingMore,
    fetchMore,
    refetch: refetchList,
    isFetching: isFetchingList,
  } = useInfiniteList<T>(api, PAGE_SIZE, filter, {
    enabled: !searchEnabled,
  });
  const listItems = useMemo(
    () => listData?.reduce((accl, t) => accl.concat(t.items), [] as T[]),
    [listData]
  );

  const {
    data: searchItems,
    isFetched: searchFetched,
    refetch: refetchSearch,
    isFetching: isSearching,
  } = useSearch<T>(
    api,
    query!,
    {
      limit: searchCount,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    },
    {
      enabled: searchEnabled,
    }
  );
  const isFetched = listFetched || searchFetched;
  const isFetching = isFetchingList || isSearching;
  const items = searchEnabled ? searchItems : listItems;

  return {
    list: {
      listItems,
      refetchList,
      canFetchMore,
      isFetchingMore,
      fetchMore,
      isFetchingList,
    },
    search: {
      searchItems,
      refetchSearch,
      isSearching,
    },
    isFetched,
    isFetching,
    items,
    searchEnabled,
  };
};
