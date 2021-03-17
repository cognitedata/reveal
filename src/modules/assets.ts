import builder from 'modules/sdk-builder';
import {
  Asset,
  AssetChangeById,
  AssetListScope,
  AssetSearchFilter,
} from '@cognite/sdk';

const resourceType = 'assets';

export const {
  reducer,
  count,
  search,
  items,
  list,
  listParallel,
  retrieveItemsById,
  retrieveItemsByExternalId,
  updateItemsById,
  countSelector,
  searchSelector,
  itemSelector,
  listSelector,
  externalIdMapSelector,
  retrieveSelector,
} = builder<Asset, AssetChangeById, AssetListScope, AssetSearchFilter>(
  resourceType
);
