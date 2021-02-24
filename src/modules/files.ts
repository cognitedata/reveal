import {
  FilesSearchFilter,
  FileInfo,
  FileRequestFilter,
  FileChangeUpdateById,
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
} = builder<
  FileInfo,
  FileChangeUpdateById,
  FileRequestFilter,
  FilesSearchFilter
>('files');

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
