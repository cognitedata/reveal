import builder from 'modules/sdk-builder';
import {
  FileInfo,
  FileChangeUpdateById,
  FileRequestFilter,
  FilesSearchFilter,
} from '@cognite/sdk';

const resourceType = 'files';

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
} = builder<
  FileInfo,
  FileChangeUpdateById,
  FileRequestFilter,
  FilesSearchFilter
>(resourceType);
