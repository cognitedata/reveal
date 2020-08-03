import {
  TimeseriesFilterQuery,
  TimeSeriesSearchDTO,
  GetTimeSeriesMetadataDTO,
  TimeSeriesUpdateById,
} from '@cognite/sdk';
import { RootState } from 'reducers';
import resourceBuilder from './sdk-builder';
import { Result } from './sdk-builder/types';

const NAME = 'timeseries';
type Resource = GetTimeSeriesMetadataDTO;
type Change = TimeSeriesUpdateById;
type ListScope = TimeseriesFilterQuery;
type SearchFilter = TimeSeriesSearchDTO;

const {
  reducer,
  retrieve,
  retrieveExternal,
  update,
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

const countTimeseriesSelector = createCountSelector(
  (state: RootState) => state[NAME].count
);

export {
  reducer,
  retrieve,
  retrieveExternal,
  update,
  search,
  count,
  list,
  listParallel,
  searchSelector,
  itemSelector,
  listSelector,
  countSelector,
  countTimeseriesSelector,
  retrieveSelector,
};
export default reducer;
