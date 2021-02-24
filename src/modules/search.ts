import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  AssetListScope,
  FilesSearchFilter,
  TimeseriesFilterQuery,
  EventFilterRequest,
} from '@cognite/sdk';
import { ResourceType } from 'modules/sdk-builder/types';
import {
  list as listTimeseries,
  search as searchTimeseries,
  count as countTimeseries,
} from './timeseries';
import {
  list as listAssets,
  search as searchAssets,
  count as countAssets,
} from './assets';
import {
  list as listFiles,
  search as searchFiles,
  count as countFiles,
} from './files';
import {
  list as listSequences,
  search as searchSequences,
  count as countSequences,
} from './sequences';
import {
  list as listEvents,
  search as searchEvents,
  count as countEvents,
} from './events';

export interface Filter {
  filter?: any;
  search?: any;
}
// Reducer
export type SearchStore = {
  [key in ResourceType]: Filter;
};

const searchOrListSequences = (q: Filter) => async (
  dispatch: ThunkDispatch<any, void, AnyAction>
) => {
  dispatch(countSequences({ filter: q.filter }));
  if (q.search) {
    dispatch(searchSequences(q));
  } else if (q.filter) {
    dispatch(listSequences(q as AssetListScope));
  }
};

const searchOrListAssets = (q: Filter) => async (
  dispatch: ThunkDispatch<any, void, AnyAction>
) => {
  dispatch(countAssets({ filter: q.filter }));
  if (q.search) {
    dispatch(searchAssets(q));
  } else if (q.filter) {
    dispatch(listAssets(q as AssetListScope));
  }
};

const searchOrListFiles = (q: Filter) => async (
  dispatch: ThunkDispatch<any, void, AnyAction>
) => {
  dispatch(countFiles({ filter: q.filter }));
  if (q.search) {
    dispatch(searchFiles(q));
  } else if (q.filter) {
    dispatch(listFiles(q as FilesSearchFilter));
  }
};

const searchOrListTimeseries = (q: Filter) => async (
  dispatch: ThunkDispatch<any, void, AnyAction>
) => {
  dispatch(countTimeseries({ filter: q.filter }));
  if (q.search) {
    dispatch(searchTimeseries(q));
  } else {
    dispatch(listTimeseries({ filter: q.filter } as TimeseriesFilterQuery));
  }
};

const searchOrListEvents = (q: Filter) => async (
  dispatch: ThunkDispatch<any, void, AnyAction>
) => {
  dispatch(countEvents({ filter: q.filter }));
  if (q.search) {
    dispatch(searchEvents(q));
  } else {
    dispatch(listEvents({ filter: q.filter } as EventFilterRequest));
  }
};

export const doSearch = (type: ResourceType, filter: Filter) => async (
  dispatch: ThunkDispatch<any, void, AnyAction>
) => {
  switch (type) {
    case 'assets': {
      dispatch(searchOrListAssets(filter));
      break;
    }
    case 'files': {
      dispatch(searchOrListFiles(filter));
      break;
    }
    case 'timeseries': {
      dispatch(searchOrListTimeseries(filter));
      break;
    }
    case 'sequences': {
      dispatch(searchOrListSequences(filter));
      break;
    }
    case 'events': {
      dispatch(searchOrListEvents(filter));
      break;
    }

    default: {
      throw new Error(`Unsupported ResourceType: ${type}`);
    }
  }
};
