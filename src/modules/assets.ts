import {
  Asset,
  AssetSearchFilter,
  AssetListScope,
  AssetChangeById,
} from '@cognite/sdk';
import builder from './sdk-builder';

const {
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
} = builder<Asset, AssetChangeById, AssetListScope, AssetSearchFilter>(
  'assets'
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
