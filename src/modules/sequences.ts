import {
  Sequence,
  SequenceSearchFilter,
  SequenceListScope,
  SequencePatch,
  InternalId,
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
  Sequence,
  SequencePatch & InternalId,
  SequenceListScope,
  SequenceSearchFilter
>('sequences');

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
