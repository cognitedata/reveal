import {
  CogniteEvent,
  EventSearchRequest,
  EventFilterRequest,
  EventChangeById,
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
  CogniteEvent,
  EventChangeById,
  EventFilterRequest,
  EventSearchRequest
>('events');

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
