import { useMemo } from 'react';
import flatten from 'lodash/flatten';
import {
  FileInfo,
  Asset,
  CogniteEvent,
  Sequence,
  Timeseries,
  Datapoints,
  DatapointAggregates,
} from '@cognite/sdk';
import {
  useInfiniteList,
  useInfiniteSearch,
  SdkResourceType,
  baseCacheKey,
} from '@cognite/sdk-react-query-hooks';
import { useQueries } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { calculateGranularity } from '@data-exploration-components/containers';
import { transformNewFilterToOldFilter } from '@data-exploration-components/domain/transformers';

type ResourceType = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

const PAGE_SIZE = 50;

// Adding this same as the num of point in Timeseries charts component to easily apply the cache
const NUMBER_OF_POINTS = 1000;

export const useDatapointFromTimeseries = <T extends ResourceType>(
  items: T[],
  dateRange: [Date, Date],
  api: SdkResourceType,
  hideEmptyData?: boolean
) => {
  const sdk = useSDK();

  const timeseriesAggregateResults = useQueries(
    items.map((timeseries) => ({
      queryKey: [
        ...baseCacheKey('timeseries'),
        'datapoints',
        timeseries.id,
        {
          start: dateRange[0].getTime(),
          end: dateRange[1].getTime(),
        },
        calculateGranularity(
          dateRange.map((el) => el.valueOf()),
          NUMBER_OF_POINTS
        ),
        NUMBER_OF_POINTS,
        ['count', 'min', 'max', 'average'],
      ],
      enabled:
        api === 'timeseries' && hideEmptyData && items && items?.length > 0,
      select: (data: DatapointAggregates[] | Datapoints[]) => ({
        datapoints: data[0].datapoints,
        id: data[0].id,
      }),
      queryFn: async () =>
        sdk.datapoints.retrieve({
          items: [{ id: timeseries.id }],
          end: dateRange[1].valueOf(),
          start: dateRange[0].valueOf(),
          granularity: calculateGranularity(
            dateRange.map((el) => el.valueOf()),
            NUMBER_OF_POINTS
          ),
          limit: NUMBER_OF_POINTS,
          aggregates: ['count', 'min', 'max', 'average'],
        }),
    }))
  );
  if (api !== 'timeseries' || !hideEmptyData) return items;
  // Making sure all the queries are loaded
  const isAllAggregatesReady = timeseriesAggregateResults.every(
    ({ isLoading }) => !isLoading
  );

  const endResult = !isAllAggregatesReady
    ? items
    : items.filter((timeseries) => {
        const correspondingAggregateResult = timeseriesAggregateResults.find(
          (agrResult) => agrResult.data?.id === timeseries.id
        );

        // Handling the cases where some queeirs have error and response is not success then we filter the data
        if (
          typeof correspondingAggregateResult === 'undefined' ||
          correspondingAggregateResult?.isError ||
          !correspondingAggregateResult.isSuccess
        )
          return false;

        return correspondingAggregateResult?.data?.datapoints.length > 0;
      });
  return endResult;
};

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

  //TODO Rewrite this logic
  // This was causing the whole table to rerender and making alot of api request will need to be fix in the future to hide empty data columns
  // const itemsWithoutEmptyDataPoints = useDatapointFromTimeseries(
  //   items,
  //   dateRange,
  //   api,
  //   hideEmptyData
  // );

  return { ...result, items };
};
