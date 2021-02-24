import { combineReducers } from 'redux';
import { InternalId } from '@cognite/sdk';
import { RootState } from 'reducers';
import { ResourceType, Query, Result } from './types';

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
  itemProcessor: (r: Resource) => Resource = (r) => r
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

  const {
    countAction,
    countReducer,
    createCountSelector,
  } = buildCount<ListScope>(resourceType);

  const reducer = combineReducers({
    items: itemReducer,
    list: listReducer,
    search: searchReducer,
    count: countReducer,
  });

  const searchSelector: (
    _: RootState
  ) => (q: SearchFilter) => Result<Resource> = createSearchSelector(
    (state: RootState): Map<number, Resource> =>
      // @ts-ignore
      state[resourceType].items.items,
    (state: RootState) => state[resourceType].search
  );

  const listSelector = createListSelector(
    // @ts-ignore
    (state: RootState) => state[resourceType].items.items,
    (state: RootState) => state[resourceType].list
  );

  const countSelector = createCountSelector(
    (state: RootState) => state[resourceType].count
  );

  const retrieveSelector = createRetrieveSelector(
    // @ts-ignore
    (state: RootState) => state[resourceType].items.items,
    (state: RootState) => state[resourceType].items.getById
  );

  const itemSelector = createItemSelector(
    // @ts-ignore
    (state: RootState) => state[resourceType].items.items,
    (state: RootState) => state[resourceType].items.getByExternalId
  );

  return {
    reducer,
    retrieve,
    update,
    retrieveExternal,
    search: searchAction,
    count: countAction,
    list: listAction,
    listParallel: listParallelAction,
    searchSelector,
    itemSelector,
    listSelector,
    countSelector,
    retrieveSelector,
  };
}
