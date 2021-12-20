import { useQuery, useQueryClient } from 'react-query';

import flatten from 'lodash/flatten';

import { getSetFromRecord } from '_helpers/getSetFromRecord';

/*
 * Fetch only the new items, get all the rest from cache
 *
 * Example:
 *
 *    if you pass in [1,2] it will fetch and cache them
 *    then if you pass in [3] it will fetch add that onto the cache
 *    so the cache will now contain 3 items
 *    then if you request [1,2,3,4] it will only fetch item 4
 *
 */
export const useSmartCache = <T>({
  key,
  tempKey,
  items,
  fetchAction,
}: {
  key: string | string[];
  tempKey: string | string[];
  items: Set<string>;
  fetchAction: (items: Set<string>) => Promise<Record<string, T[]>>;
}) => {
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

  const itemsFromCache = flatten(getSetFromRecord(items, previousCache));

  return useQuery(
    tempKey,
    () => {
      if (newItemsToFetch.size === 0) {
        return Promise.resolve(Object.values(itemsFromCache));
      }

      return fetchAction(newItemsToFetch).then((groupedEvents) => {
        const updatedCache = previousCache;

        // merge the new data into the existing cache
        Object.keys(groupedEvents).forEach((id) => {
          const existing = updatedCache[id];

          if (!existing) {
            updatedCache[id] = groupedEvents[id];
          }
        });

        queryClient.setQueryData(key, updatedCache);

        return Object.values(flatten(getSetFromRecord(items, updatedCache)));
      });
    },
    { enabled: items.size > 0 }
  );
};

// once the above function is settled, then we can break it apart
// into smaller pieces to help maintaince
//
// const findUncached = <T>({
//   key,
//   items,
// }: {
//   key: string;
//   items: Set<string>;
// }) => {
//   const queryClient = useQueryClient();

//   const emptyCache: Record<string, T[]> = {};
//   const previousCache =
//     queryClient.getQueryData<Record<string, T[]>>(key) || emptyCache;
//   // console.log('previousCache', previousCache);

//   const uncached = previousCache
//     ? Array.from(items.keys()).reduce((result, possibleNewItemId) => {
//         if (previousCache && !previousCache[possibleNewItemId]) {
//           result.add(possibleNewItemId);
//         }
//         return result;
//       }, new Set<string>())
//     : items;

//   return uncached;
// };
