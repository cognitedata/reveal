import * as React from 'react';
import { useQuery, useQueryClient } from 'react-query';

import pick from 'lodash/pick';
import { FetchOptions } from 'utils/fetchAllCursors';

/*
 * Fetch only the new items, get all the rest from cache
 *
 * Note: data is stored as Record<string, T[]>
 *
 * Example:
 *
 *    if you pass in [1,2] it will fetch and cache them
 *    then if you pass in [3] it will fetch add that onto the cache
 *    so the cache will now contain 3 items
 *    then if you request [1,2,3,4] it will only fetch item 4
 *
 */
export type CacheProps<T> = {
  key: string | string[];
  items: Set<string>;
  fetchAction: (
    items: Set<string>,
    options?: FetchOptions
  ) => Promise<Record<string, T[]>>;
};
export const useCache = <T>({ key, items, fetchAction }: CacheProps<T>) => {
  const queryClient = useQueryClient();

  const emptyCache: Record<string, T[]> = {};
  const previousCache =
    queryClient.getQueryData<Record<string, T[]>>(key) || emptyCache;
  // console.log('previousCache', previousCache);

  const newItemsToFetch = previousCache
    ? Array.from(items.keys()).reduce((result, possibleNewItemId) => {
        if (previousCache && !previousCache[possibleNewItemId]) {
          result.add(possibleNewItemId);
        }
        return result;
      }, new Set<string>())
    : items;
  // console.log('newItemsToFetch', newItemsToFetch.size);

  return useQuery(
    [key, ...Array.from(items)],
    ({ signal }) => {
      if (newItemsToFetch.size === 0) {
        return previousCache;
      }

      return fetchAction(newItemsToFetch, { signal }).then((groupedEvents) => {
        const updatedCache = previousCache;

        // merge the new data into the existing cache
        Object.keys(groupedEvents).forEach((id) => {
          const existing = updatedCache[id];

          if (!existing) {
            updatedCache[id] = groupedEvents[id];
          }
        });

        queryClient.setQueryData<Record<string, T[]>>(key, updatedCache);

        return updatedCache;
      });
    },
    {
      cacheTime: 1,
      enabled: items.size > 0,
      // ✅ memoizes with useCallback
      // https://tkdodo.eu/blog/react-query-data-transformations#3-using-the-select-option
      select: React.useCallback(
        (data: Record<string, T[]>) => {
          return pick(data, Array.from(items.keys()));
        },
        [items.keys()]
      ),
    }
  );
};
