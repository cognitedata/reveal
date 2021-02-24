import {
  TimeSeriesUpdateById,
  Timeseries,
  TimeseriesFilterQuery,
  TimeseriesSearchFilter,
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
  Timeseries,
  TimeSeriesUpdateById,
  TimeseriesFilterQuery,
  TimeseriesSearchFilter
>('timeseries');

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
