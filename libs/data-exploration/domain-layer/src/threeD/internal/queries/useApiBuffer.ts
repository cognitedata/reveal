import { useCallback, useEffect, useMemo } from 'react';

import {
  InfiniteQueryObserverResult,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';

import { useThreeDSearchContext } from '@data-exploration-lib/core';

import { MAX_SEQUENTIAL_REQUEST_LIMIT_3D } from '../../../constants';
import { TableSortBy } from '../../../types';

export type ApiBufferApi = { enabled: boolean } & UseInfiniteQueryResult;
export const useApiBuffer = (
  apiArr: Array<ApiBufferApi>,
  limitForPage: number,
  sort?: TableSortBy[],
  query?: string,
  options: {
    autoLoad: boolean;
    requestLimit: number;
  } = { autoLoad: false, requestLimit: MAX_SEQUENTIAL_REQUEST_LIMIT_3D }
) => {
  const { resultIndex, setResultIndex, setPageLimit } =
    useThreeDSearchContext();

  // set page limit
  useEffect(() => {
    setPageLimit(limitForPage);
  }, [limitForPage]);

  // reset page index when sort and query changes
  useEffect(() => {
    setResultIndex(limitForPage);
  }, [sort, query, limitForPage]);

  /**
   * Simulate Pagination
   * simulates pagination by offering fixed set of results from all available api's
   * fetches next page if required
   */
  const fetchUntilFulfill = useCallback(
    (apiIndex: number, moreResults: number) => {
      (async () => {
        const api = apiArr[apiIndex];
        const currentResults = getResultCount(api);
        const data = await api.fetchNextPage();
        const resultDiff = getResultCount(data) - currentResults;
        if (resultDiff < moreResults) {
          fetchUntilFulfill(apiIndex, moreResults - resultDiff);
        }
      })();
    },
    [apiArr]
  );

  const fetchNextPage = useCallback(
    (nextIndex: number) => {
      let apiResults = 0;

      for (const [index, api] of apiArr.entries()) {
        if (!api.enabled) {
          continue;
        }
        apiResults = apiResults + getResultCount(api);

        if (apiResults <= nextIndex + 1) {
          if (api.hasNextPage) {
            fetchUntilFulfill(index, nextIndex + 1 - apiResults);
          }
          continue;
        } else {
          break;
        }
      }
    },
    [apiArr]
  );

  const loadMore = useCallback(() => {
    const nextIndex = resultIndex + limitForPage;
    setResultIndex(nextIndex);
    fetchNextPage(nextIndex);
  }, [resultIndex, limitForPage, fetchNextPage]);

  const data = useMemo(() => {
    let apiResults: any[] = [];

    for (const [_, api] of apiArr.entries()) {
      if (!api.enabled) {
        continue;
      }
      const apiResult = getResultArray(api);
      apiResults = [...apiResults, ...apiResult];
    }

    if (sort && sort.length) {
      for (const key of sort) {
        apiResults = apiResults.sort((m1, m2) => {
          return m1[key.id]
            .toLocaleLowerCase()
            .localeCompare(m2[key.id].toLocaleLowerCase());
        });

        if (key.desc) {
          apiResults = apiResults.reverse();
        }
      }
    }

    return apiResults.slice(0, resultIndex);
  }, [apiArr, resultIndex, sort]);

  /**
   * Simulate Pagination - End
   */

  /**
   * Auto fetch pages
   * Fetches pages from available api's until all results are fetched or max number of sequential requests are fetched
   */

  const fetchToCompletion = useCallback(
    async (api: any, requestCount: number): Promise<number> => {
      if (requestCount === options?.requestLimit) {
        return requestCount;
      }
      if (!api.hasNextPage) {
        return requestCount;
      }
      const updatedApi = await api.fetchNextPage({ cancelRefetch: false });
      return fetchToCompletion(updatedApi, requestCount + 1);
    },
    [apiArr, options?.requestLimit]
  );

  const fetchAllResults = useCallback(() => {
    let apiRequests = 0;

    for (const [_, api] of apiArr.entries()) {
      if (api.isFetching) {
        break;
      }
      if (!api.enabled || !api.hasNextPage) {
        continue;
      }
      apiRequests = apiRequests + getPageCount(api);

      if (apiRequests < options.requestLimit) {
        fetchToCompletion(api, apiRequests);
      } else {
        break;
      }
    }
  }, [apiArr, options.requestLimit, fetchToCompletion]);

  const areApisLoadedOnce = useMemo(() => {
    return apiArr
      .filter((api) => api.enabled)
      .every((api) => api.isFetched && api.data?.pages.length === 1);
  }, [apiArr]);

  useEffect(() => {
    if (options?.autoLoad && areApisLoadedOnce) {
      fetchAllResults();
    }
  }, [options?.autoLoad, areApisLoadedOnce]);

  /**
   * Auto fetch pages - End
   */

  const allResultsCount = useMemo(() => {
    return apiArr
      .filter((api) => api.enabled)
      .flatMap((api) => getResultArray(api)).length;
  }, [apiArr]);

  return {
    loadMore,
    data,
    isFetching: apiArr
      .filter((api) => api.enabled)
      .some((api) => api.isFetching),
    canFetchMore:
      allResultsCount > resultIndex ||
      apiArr.filter((api) => api.enabled).some((api) => api.hasNextPage),
    fetchedCount: allResultsCount,
  };
};

const getResultCount = (result: InfiniteQueryObserverResult<any, any>) => {
  return result.data
    ? result.data.pages.flatMap((page) => page.items).length
    : 0;
};

const getResultArray = (result: InfiniteQueryObserverResult<any, any>) => {
  return result.data ? result.data.pages.flatMap((page) => page.items) : [];
};

const getPageCount = (result: InfiniteQueryObserverResult<any, any>) => {
  return result.data ? result.data.pages.length : 0;
};
