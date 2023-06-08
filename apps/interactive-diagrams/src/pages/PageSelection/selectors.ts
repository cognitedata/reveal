import {
  ResourceType,
  Filter,
} from '@interactive-diagrams-app/modules/sdk-builder/types';
import {
  getCountsSelector,
  getItemListSelector,
  getItemsSearchSelector,
} from '@interactive-diagrams-app/modules/workflows';
import { createSelector } from 'reselect';

export const searchCountSelector = (type: ResourceType, filter: Filter) =>
  createSelector(
    getCountsSelector,
    getItemsSearchSelector,
    (getCount: any, getItemsSearch: any) => {
      if (filter.search) {
        const search = getItemsSearch(type)(filter) || {};
        return search.items?.length || 0;
      }
      const adjustedFilter = filter.filter ? filter : { filter };
      return getCount(type)(adjustedFilter)?.count;
    }
  );

export const searchItemSelector = (type: ResourceType, filter: Filter) =>
  createSelector(
    getItemListSelector,
    getItemsSearchSelector,
    (getItemsList: any, getItemsSearch: any) => {
      if (filter.search) {
        return getItemsSearch(type)(filter);
      }
      return getItemsList(type)(filter, false);
    }
  );
