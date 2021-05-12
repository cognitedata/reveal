import { createSelector } from '@reduxjs/toolkit';
import { InternalId } from '@cognite/sdk';
import { RootState } from 'store';
import { Result, Query, SearchState, ItemsList } from 'modules/types';

export function createSearchSelector<T extends InternalId, Q extends Query>(
  itemsSelector: (_: RootState) => ItemsList<T>,
  searchSelector: (_: RootState) => SearchState
): (_: RootState) => (q: Q) => Result<T> {
  const searchIncludingItemsSelector = createSelector(
    itemsSelector,
    searchSelector,
    (items, searches) => {
      const searchKeys = Object.keys(searches);
      return searchKeys.reduce((accl, key) => {
        return {
          ...accl,
          [key]: {
            ...searches[key],
            items: (searches[key].ids || [])
              .map((id: any) => {
                return items[id];
              })
              .filter((id: any) => !!id) as any[],
            progress: searches[key].status === 'success' ? 1 : 0,
          },
        };
      }, {} as { [key: string]: Result<any> });
    }
  ) as any;

  return createSelector(
    searchIncludingItemsSelector,
    (searches: any) => (filter: Q) => {
      const key = JSON.stringify(filter);
      return (searches[key] || {
        fetching: false,
        error: false,
        ids: [],
        items: [],
      }) as Result<T>;
    }
  );
}
