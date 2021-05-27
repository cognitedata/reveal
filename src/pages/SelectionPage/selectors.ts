import { ResourceType, Filter } from 'modules/sdk-builder/types';
import { createSelector } from 'reselect';
import {
  getCountsSelector,
  getItemListSelector,
  getItemsSearchSelector,
} from 'modules/workflows';

export const searchCountSelector = (type: ResourceType, filter: Filter) =>
  createSelector(
    getCountsSelector,
    getItemsSearchSelector,
    (getCount: any, getItemsSearch: any) => {
      if (filter.search) {
        const search = getItemsSearch(type)(filter) || {};
        return search.items?.length || 0;
      }
      return getCount(type)({ filter: filter.filter })?.count;
    }
  );

export const searchItemSelector = createSelector(
  getItemListSelector,
  getItemsSearchSelector,
  (getItemsList: any, getItemsSearch: any) => (
    type: ResourceType,
    filter: Filter
  ) => {
    if (filter.search) return getItemsSearch(type)(filter);
    return getItemsList(type)(filter, false);
  }
);
