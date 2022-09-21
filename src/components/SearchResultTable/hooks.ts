import {
  useAggregate,
  useCdfItems,
  useInfiniteSearch,
} from '@cognite/sdk-react-query-hooks';
import { Asset, Timeseries, TimeseriesFilter } from '@cognite/sdk';
import { SearchFilter } from 'components/Search/Search';
import { useMemo } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';

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
          ({ externalId }) => externalId !== timeseriesExactMatch?.externalId
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
    20,
    { ...rootAssetFilter },
    {
      enabled: !!query,
    }
  );

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

  const { data: dataAmount } = useAggregate(
    'timeseries',
    {
      assetIds: assets?.map(({ id }) => id),
      isStep: filter?.isStep,
      isString: filter?.isString,
    },
    { enabled: shouldFetchCount && assets && assets.length > 0 }
  );

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

  const hasResults = !(
    assets?.length === 0 ||
    (shouldFetchCount && dataAmount?.count === 0)
  );

  return {
    resultExactMatch: assetExactMatch,
    results: assets,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    hasResults,
    totalCount: getCountString(
      assetCountData?.length,
      assetCountLoading,
      assetCountSuccess
    ),
    assetCountLoading,
  };
};
