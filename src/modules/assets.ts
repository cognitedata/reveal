import {
  Asset,
  AssetSearchFilter,
  AssetListScope,
  AssetChangeById,
} from '@cognite/sdk';
import { RootState } from 'reducers';
import resourceBuilder from './sdk-builder';
import { Result } from './sdk-builder/types';

const NAME = 'assets';
type Resource = Asset;
type Change = AssetChangeById;
type ListScope = AssetListScope;
type SearchFilter = AssetSearchFilter;

const {
  reducer,
  retrieve,
  update,
  retrieveExternal,
  searchAction: search,
  countAction: count,
  listAction: list,
  listParallelAction: listParallel,

  createSearchSelector,
  createListSelector,
  createCountSelector,
  createRetrieveSelector,
  createItemSelector,
} = resourceBuilder<Resource, Change, ListScope, SearchFilter>(NAME);

const searchSelector: (
  _: RootState
) => (q: SearchFilter) => Result<Resource> = createSearchSelector(
  // @ts-ignore
  (state: RootState): Map<number, Resource> => state[NAME].items.items,
  (state: RootState) => state[NAME].search
);

const listSelector = createListSelector(
  // @ts-ignore
  (state: RootState) => state[NAME].items.items,
  (state: RootState) => state[NAME].list
);

const countSelector = createCountSelector(
  (state: RootState) => state[NAME].count
);

const retrieveSelector = createRetrieveSelector(
  (state: RootState) => state[NAME].items.items,
  (state: RootState) => state[NAME].items.getById
);

const itemSelector = createItemSelector(
  (state: RootState) => state[NAME].items.items,
  (state: RootState) => state[NAME].items.getByExternalId
);

export {
  reducer,
  retrieve,
  update,
  retrieveExternal,
  search,
  count,
  list,
  listParallel,
  searchSelector,
  itemSelector,
  listSelector,
  countSelector,
  retrieveSelector,
};
export default reducer;
