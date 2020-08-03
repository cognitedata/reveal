import { combineReducers } from 'redux';

import { InternalId } from '@cognite/sdk';

import { ResourceType, Query } from './types';

import buildCount from './count';
import buildSearch from './search';
import buildList from './list';
import buildItems from './items';

export default function resourceBuilder<
  Resource extends InternalId,
  Change extends { id: number; update: any },
  ListScope extends Query,
  SearchFilter extends Query
>(
  resourceType: ResourceType,
  itemProcessor: (r: Resource) => Resource = r => r
) {
  const {
    retrieve,
    retrieveExternal,
    update,
    itemReducer,
    createItemSelector,
    createRetrieveSelector,
  } = buildItems<Resource, Change>(resourceType);

  const {
    listAction,
    listParallelAction,
    listReducer,
    createListSelector,
  } = buildList<ListScope, Resource>(resourceType, itemProcessor);

  const { searchAction, searchReducer, createSearchSelector } = buildSearch<
    Resource,
    SearchFilter
  >(resourceType, itemProcessor);

  const { countAction, countReducer, createCountSelector } = buildCount<
    ListScope
  >(resourceType);

  const reducer = combineReducers({
    items: itemReducer,
    list: listReducer,
    search: searchReducer,
    count: countReducer,
  });

  return {
    reducer,
    retrieve,
    retrieveExternal,
    update,
    searchAction,
    countAction,
    listAction,
    listParallelAction,

    createSearchSelector,
    createListSelector,
    createCountSelector,
    createRetrieveSelector,
    createItemSelector,
  };
}
