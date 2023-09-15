import { useCallback, useEffect, useMemo, useState } from 'react';

import { SearchFilter } from '@charts-app/components/Search/Search';
import { useQuery } from '@tanstack/react-query';
import { last } from 'lodash';

import { Asset, Timeseries, TimeseriesFilter } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import {
  useAggregate,
  useCdfItems,
  useInfiniteSearch,
} from '@cognite/sdk-react-query-hooks';

const MAX_SEARCH_OFFSET = 1000;
const RESULTS_TO_FETCH = 20;

type Props = {
  filter: TimeseriesFilter;
  query: string;
  enabled: boolean;
};

const stringifyFilter = (filter: TimeseriesFilter) => {
  const filterString = `${filter.isStep}${filter.isString}`;
  return filterString;
};

export const useGetTimeseriesSearchCount = ({
  filter,
  query,
  enabled,
}: Props) => {
  const sdk = useSDK();
  return useQuery(
    ['tsCount', query, stringifyFilter(filter)],
    async () => {
      return sdk.timeseries.search({
        filter,
        search: { query },
        limit: 1000,
      });
    },
    { cacheTime: 0, enabled }
  );
};

export const useGetAssetSearchCount = ({ filter, query, enabled }: Props) => {
  const sdk = useSDK();
  return useQuery(
    ['assetCount', query, stringifyFilter(filter)],
    async () => {
      return sdk.assets.search({
        filter,
        search: { query },
        limit: 1000,
      });
    },
    { cacheTime: 0, enabled }
  );
};

const getCountString = (
  count: number | undefined,
  isLoading: boolean,
  isSuccess: boolean
) => {
  const limit = 1000;
  if (isLoading) {
    return '';
  }
  if (isSuccess) {
    return count && count === limit ? `(${count}+)` : `(${count})`;
  }
  return '';
};

export const useTimeseriesSearchResult = ({
  query,
  filter,
}: {
  query: string;
  filter: SearchFilter;
}) => {
  const rootAssetFilter = filter.rootAsset
    ? { assetSubtreeIds: [{ externalId: filter.rootAsset }] }
    : {};
  const shouldFetchCount = !!query;
  const {
    data: resourcesBySearch,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteSearch<Timeseries>(
    'timeseries',
    query,
    20,
    { isStep: filter.isStep, isString: filter.isString, ...rootAssetFilter },
    {
      enabled: shouldFetchCount,
    }
  );

  const {
    data: tsCountData,
    isSuccess: tsCountSuccess,
    isLoading: tsCountLoading,
  } = useGetTimeseriesSearchCount({
    filter: {
      isStep: filter.isStep,
      isString: filter.isString,
      ...rootAssetFilter,
    },
    query,
    enabled: shouldFetchCount,
  });
  const { data: resourcesByExternalId } = useCdfItems<Timeseries>(
    'timeseries',
    [{ externalId: query }]
  );

  const timeseriesExactMatch = useMemo(
    () =>
      resourcesByExternalId?.filter(
        ({ externalId }) => externalId === query
      )[0],
    [resourcesByExternalId, query]
  );

  const timeseries = useMemo(
    () =>
      resourcesBySearch?.pages
        ?.reduce((accl, page) => accl.concat(page), [])
        .filter(
          ({ externalId }) =>
            externalId !== timeseriesExactMatch?.externalId ||
            timeseriesExactMatch?.externalId === undefined
        ),
    [resourcesBySearch, timeseriesExactMatch]
  );

  const hasResults = !!timeseries?.length;

  return {
    resultExactMatch: timeseriesExactMatch,
    results: timeseries,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    hasResults,
    totalCount: getCountString(
      tsCountData?.length,
      tsCountLoading,
      tsCountSuccess
    ),
    tsCountLoading,
  };
};

export const useAssetSearchResults = ({
  query,
  filter,
}: {
  query: string;
  filter: SearchFilter;
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [offsetExceededLimit, setOffsetExceededLimit] = useState(false);

  const rootAssetFilter = filter.rootAsset
    ? { assetSubtreeIds: [{ externalId: filter.rootAsset }] }
    : {};

  const {
    data: resourcesBySearch,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteSearch<Asset>(
    'assets',
    query,
    RESULTS_TO_FETCH,
    { ...rootAssetFilter },
    {
      enabled: !!query,
    }
  );

  const fetchNextPageWrapper = useCallback(() => {
    setIsSearching(true);
    fetchNextPage();
  }, [fetchNextPage]);

  const { data: resourcesByExternalId } = useCdfItems<Asset>('assets', [
    { externalId: query },
  ]);

  const assetExactMatch = useMemo(
    () =>
      resourcesByExternalId?.filter(
        ({ externalId }) => externalId === query
      )[0],
    [resourcesByExternalId, query]
  );

  const assets = useMemo(
    () =>
      resourcesBySearch?.pages
        ?.reduce((accl, page) => accl.concat(page), [])
        .filter(({ externalId }) => externalId !== query),
    [resourcesBySearch, query]
  );

  const shouldFetchCount = useMemo(
    () => Boolean(query) && !filter?.showEmpty,
    [query, filter]
  );

  const currentPage = resourcesBySearch?.pages.length || 0;

  const { data: dataAmount, isFetched: dataAmountFetched } = useAggregate(
    'timeseries',
    {
      assetIds: resourcesBySearch?.pages[currentPage - 1].map(({ id }) => id),
      isStep: filter?.isStep,
      isString: filter?.isString,
    },
    { enabled: shouldFetchCount && assets && assets.length > 0 }
  );

  useMemo(() => {
    setOffsetExceededLimit(false);
    setIsSearching(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filter.isStep, filter.isString, filter.showEmpty]);

  const pageParams = resourcesBySearch?.pageParams;
  useEffect(() => {
    if (dataAmountFetched && dataAmount) {
      if (pageParams) {
        const offset = last(pageParams) as number;
        const limit = MAX_SEARCH_OFFSET - RESULTS_TO_FETCH;
        if (offset >= limit) {
          setIsSearching(false);
          setOffsetExceededLimit(true);
        } else {
          if (dataAmount?.count <= 0) {
            fetchNextPageWrapper();
          } else {
            setIsSearching(false);
          }
          if (hasNextPage === false) {
            setIsSearching(false);
          }
        }
      }
    }
  }, [
    dataAmountFetched,
    dataAmount,
    fetchNextPageWrapper,
    hasNextPage,
    pageParams,
  ]);

  const {
    data: assetCountData,
    isSuccess: assetCountSuccess,
    isLoading: assetCountLoading,
  } = useGetAssetSearchCount({
    filter: {
      ...rootAssetFilter,
      isStep: filter?.isStep,
    },
    query,
    enabled: !!query,
  });

  const hasResults = !(assetCountData?.length === 0);

  return {
    resultExactMatch: assetExactMatch,
    results: assets,
    isLoading,
    isFetchingNextPage: isSearching,
    isError,
    fetchNextPage: fetchNextPageWrapper,
    hasNextPage: offsetExceededLimit ? false : hasNextPage,
    hasResults,
    totalCount: getCountString(
      assetCountData?.length,
      assetCountLoading,
      assetCountSuccess
    ),
    assetCountLoading,
    currentPage,
    resultsToFetch: RESULTS_TO_FETCH,
  };
};
