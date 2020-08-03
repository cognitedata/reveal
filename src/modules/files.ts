import {
  FilesSearchFilter,
  FilesMetadata,
  FileRequestFilter,
  FileChangeUpdateById,
} from '@cognite/sdk';
import { RootState } from 'reducers';
import resourceBuilder from './sdk-builder';
import { Result } from './sdk-builder/types';

const NAME = 'files';
type Resource = FilesMetadata;
type Change = FileChangeUpdateById;
type ListScope = FileRequestFilter;
type SearchFilter = FilesSearchFilter;

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
  (state: RootState) => state[NAME].items.items,
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
