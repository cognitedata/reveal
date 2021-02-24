import { ResourceType } from 'modules/sdk-builder/types';

import {
  getCountsSelector,
  getItemListSelector,
  getItemsSearchSelector,
} from 'modules/selection';
import { createSelector } from 'reselect';
import { Filter } from 'modules/search';

export const searchCountSelector = (type: ResourceType, filter: Filter) =>
  createSelector(
    getCountsSelector,
    getItemsSearchSelector,
    (getCount, getItemsSearch) => {
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
  (getItemsList, getItemsSearch) => (type: ResourceType, filter: Filter) => {
    if (filter.search) {
      return getItemsSearch(type)(filter) as {
        fetching: boolean;
        items: {
          id: number;
          name: string;
        }[];
      };
    }
    return getItemsList(type)(filter, false) as {
      fetching: boolean;
      items: {
        id: number;
        name: string;
      }[];
    };
  }
);
