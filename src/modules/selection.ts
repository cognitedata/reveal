import produce from 'immer';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { v4 as uuid } from 'uuid';
import { createSelector } from 'reselect';
import { InternalId } from '@cognite/sdk';
import { RootState } from '../reducers/index';
import { ResourceType } from './sdk-builder/types';
import {
  countSelector as countTimeseriesSelector,
  list as listTimeseries,
  count as countTimeseries,
  listParallel as listTimeseriesParallel,
  listSelector as listTimeseriesSelector,
  retrieve as retrieveTimeseries,
  retrieveSelector as retrieveTimeseriesSelector,
  searchSelector as searchTimeseriesSelector,
} from './timeseries';

import {
  countSelector as countFileSelector,
  list as listFiles,
  count as countFiles,
  listSelector as listFileSelector,
  retrieve as retrieveFiles,
  retrieveSelector as retrieveFileSelector,
  searchSelector as searchFileSelector,
} from './files';
import {
  countSelector as countAssetSelector,
  list as listAssets,
  count as countAssets,
  listParallel as listAssetsParallel,
  listSelector as listAssetSelector,
  retrieve as retrieveAssets,
  retrieveSelector as retrieveAssetSelector,
  searchSelector as searchAssetSelector,
} from './assets';
import {
  countSelector as countSequencesSelector,
  list as listSequences,
  count as countSequences,
  listSelector as listSequencesSelector,
  retrieve as retrieveSequences,
  retrieveSelector as retrieveSequencesSelector,
  searchSelector as searchSequencesSelector,
} from './sequences';
import {
  countSelector as countEventsSelector,
  list as listEvents,
  count as countEvents,
  listSelector as listEventsSelector,
  retrieve as retrieveEvents,
  retrieveSelector as retrieveEventsSelector,
  searchSelector as searchEventsSelector,
} from './events';

// Constants
const CREATE_SELECTION = 'selection/CREATE_SELECTION';
const UPDATE_SELECTION = 'selection/UPDATE_SELECTION';
const SELECTION_ERROR = 'selection/SELECTION_ERROR';
const LOAD_LS_DATA = 'selection/LOAD_LS_DATA';

export type SelectionFilter = 'none' | 'missingAssetId';

interface Item {
  assetId?: number;
}
const filters = {
  none: (i: Item) => i,
  missingAssetId: (i: Item) => (i.assetId ? undefined : i),
};

export type SelectionEndpointType = 'list' | 'retrieve';

export type ResourceSelection = {
  id: string;
  type: ResourceType;
  endpoint: SelectionEndpointType;
  query: any;
  filter?: SelectionFilter;
};

type ResourceSelectionUpdate = {
  id: string;
  filter?: SelectionFilter;
};

export type PendingResourceSelection = Omit<ResourceSelection, 'id'>;

interface CreateSelectionAction extends Action<typeof CREATE_SELECTION> {
  payload: ResourceSelection;
}

interface UpdateSelectionAction extends Action<typeof UPDATE_SELECTION> {
  payload: ResourceSelectionUpdate;
}

interface SelectionErrorAction extends Action<typeof SELECTION_ERROR> {}

interface LoadLSData extends Action<typeof LOAD_LS_DATA> {
  items: {
    [key: string]: ResourceSelection;
  };
}

type SelectionActions =
  | CreateSelectionAction
  | UpdateSelectionAction
  | SelectionErrorAction
  | LoadLSData;

// Reducer
export interface SelectionStore {
  items: {
    [key: string]: ResourceSelection;
  };
  error: boolean;
}

const initialState: SelectionStore = {
  items: {},
  error: false,
};

export default function reducer(
  state = initialState,
  action: SelectionActions
): SelectionStore {
  return produce(state, draft => {
    switch (action.type) {
      case CREATE_SELECTION: {
        const { id, type, query, endpoint, filter = 'none' } = action.payload;
        draft.items[id] = {
          id,
          type,
          endpoint,
          query,
          filter,
        };
        break;
      }
      case UPDATE_SELECTION: {
        const { id } = action.payload;

        if (draft.items[id]) {
          if ('filter' in action.payload) {
            draft.items[id].filter = action.payload.filter;
          }
        }
        break;
      }
      case SELECTION_ERROR: {
        draft.error = true;
        break;
      }
      case LOAD_LS_DATA: {
        draft.items = action.items;
      }
    }
  });
}

export type LSSelection = {
  items: {
    [key: string]: ResourceSelection;
  };
  version: number;
};

const CURRENT_LS_VERSION = 1;

export function getLocalStorageContent(state: SelectionStore): LSSelection {
  return {
    items: state.items,
    version: CURRENT_LS_VERSION,
  };
}

const defaultLSData: LSSelection = {
  version: -1,
  items: {},
};
export function importLocalStorageContent(data: LSSelection = defaultLSData) {
  if (
    data.version === CURRENT_LS_VERSION &&
    Object.keys(data.items).length > 0
  ) {
    return {
      type: LOAD_LS_DATA,
      items: data.items,
    };
  }
  return { type: 'selection/LS_DATA_IMCOMPATIBLE_OR_MISSING' };
}

export const create = (resource: PendingResourceSelection) => {
  return async (
    dispatch: ThunkDispatch<any, void, SelectionActions>
  ): Promise<string> => {
    const id = uuid();
    const selection = {
      id,
      type: resource.type,
      endpoint: resource.endpoint,
      query: resource.query,
      filter: resource.filter,
    };
    await dispatch({
      type: CREATE_SELECTION,
      payload: selection,
    });

    return id;
  };
};

export const update = (u: ResourceSelectionUpdate) => {
  return async (dispatch: ThunkDispatch<any, void, SelectionActions>) => {
    dispatch({
      type: UPDATE_SELECTION,
      payload: u,
    });
  };
};

function getCountAction(type: ResourceType) {
  switch (type) {
    case 'files':
      return countFiles;
    case 'assets':
      return countAssets;
    case 'timeseries':
      return countTimeseries;
    case 'sequences':
      return countSequences;
    case 'events':
      return countEvents;
    default:
      throw new Error(`type '${type}' not supported`);
  }
}

function getRetrieveAction(type: ResourceType) {
  switch (type) {
    case 'files':
      return retrieveFiles;
    case 'assets':
      return retrieveAssets;
    case 'timeseries':
      return retrieveTimeseries;
    case 'sequences':
      return retrieveSequences;
    case 'events':
      return retrieveEvents;
    default:
      throw new Error(`type '${type}' not supported`);
  }
}

export const loadResourceSelection = (selectionId: string, loadAll = true) => {
  return async (
    dispatch: ThunkDispatch<any, void, SelectionActions>,
    getState: () => RootState
  ) => {
    try {
      const selection = getState().selection.items[selectionId];
      if (selection) {
        const { type, endpoint, query } = selection;
        const retrieveAction = getRetrieveAction(type);
        const countAction = getCountAction(type);

        if (endpoint !== 'retrieve') {
          dispatch(countAction(query));
        }

        switch (endpoint) {
          case 'retrieve':
            await dispatch(retrieveAction(query));
            break;
          case 'list': {
            switch (type) {
              case 'files':
                await dispatch(listFiles(selection.query, loadAll));
                break;
              case 'events':
                await dispatch(listEvents(selection.query, loadAll));
                break;
              case 'sequences':
                await dispatch(listSequences(selection.query, loadAll));
                break;
              case 'assets': {
                if (loadAll) {
                  await dispatch(listAssetsParallel(selection.query));
                  break;
                }
                await dispatch(listAssets(selection.query));
                break;
              }
              case 'timeseries': {
                if (loadAll) {
                  await dispatch(listTimeseriesParallel(selection.query));
                  break;
                }
                await dispatch(listTimeseries(selection.query));
                break;
              }
            }
          }
        }
      } else {
        dispatch({
          type: SELECTION_ERROR,
        });
      }
    } catch {
      dispatch({
        type: SELECTION_ERROR,
      });
    }
  };
};

// Selectors

export const stuffForTesting = {
  CREATE_SELECTION,
  initialState,
};

export const getCountsSelector = createSelector(
  countAssetSelector,
  countFileSelector,
  countTimeseriesSelector,
  countSequencesSelector,
  countEventsSelector,
  (
    assetCounter,
    fileCounter,
    timeseriesCounter,
    sequencesCounter,
    eventsCounter
  ) => (type: ResourceType) => {
    switch (type) {
      case 'files':
        return fileCounter;
      case 'assets':
        return assetCounter;
      case 'timeseries':
        return timeseriesCounter;
      case 'sequences':
        return sequencesCounter;
      case 'events':
        return eventsCounter;
      default:
        throw new Error(`type '${type}' not supported`);
    }
  }
);

export const getItemsSearchSelector = createSelector(
  searchFileSelector,
  searchAssetSelector,
  searchTimeseriesSelector,
  searchSequencesSelector,
  searchEventsSelector,
  (fileSearch, assetSearch, timeseriesSearch, sequenceSearch, eventSearch) => (
    type: ResourceType
  ) => {
    switch (type) {
      case 'assets':
        return assetSearch;
      case 'files':
        return fileSearch;
      case 'timeseries':
        return timeseriesSearch;
      case 'sequences':
        return sequenceSearch;
      case 'events':
        return eventSearch;
      default:
        throw new Error(`type '${type}' is not supported`);
    }
  }
);

export const getItemsSelector = createSelector(
  retrieveFileSelector,
  retrieveAssetSelector,
  retrieveTimeseriesSelector,
  retrieveSequencesSelector,
  retrieveEventsSelector,
  (getFiles, getAssets, getTimeseries, getSequences, getEvents) => (
    type: ResourceType
  ) => {
    switch (type) {
      case 'assets':
        return getAssets;
      case 'files':
        return getFiles;
      case 'timeseries':
        return getTimeseries;
      case 'sequences':
        return getSequences;
      case 'events':
        return getEvents;
      default:
        throw new Error(`type '${type}' is not supported`);
    }
  }
);

export const getItemListSelector = createSelector(
  listFileSelector,
  listAssetSelector,
  listTimeseriesSelector,
  listSequencesSelector,
  listEventsSelector,
  (fileList, assetList, timeseriesList, sequenceList, eventsList) => (
    type: ResourceType
  ) => {
    switch (type) {
      case 'assets':
        return assetList;
      case 'files':
        return fileList;
      case 'timeseries':
        return timeseriesList;
      case 'sequences':
        return sequenceList;
      case 'events':
        return eventsList;
      default:
        throw new Error(`type '${type}' is not supported`);
    }
  }
);

export const dataKitLengthSelector = (
  datakitId: string,
  all: boolean = false
) => {
  return createSelector(
    (state: RootState) => {
      const { endpoint, query } = state.selection.items[datakitId] || {};
      return { endpoint, query };
    },
    (state: RootState) => {
      const { type } = state.selection.items[datakitId];
      return state[type].list;
    },
    (state: RootState) => {
      const { type } = state.selection.items[datakitId];
      return state[type].items.items;
    },
    ({ endpoint, query }, list, items): number => {
      switch (endpoint) {
        case 'retrieve': {
          return (query as InternalId[])
            .map(i => i.id)
            .filter(Boolean)
            .filter(i => items.has(i)).length;
        }
        case 'list': {
          const listings: any = list;
          const key = JSON.stringify({ ...query, all });
          const request = listings[key] || {};
          return Object.values(request).reduce(
            (accl, r: any) => accl + r?.ids?.length || 0,
            0
          ) as number;
        }
        default: {
          throw new Error('unknown endpoint');
        }
      }
    }
  );
};

export const dataKitItemsSelector = createSelector(
  (state: RootState) => state.selection.items,
  getItemListSelector,
  getItemsSelector,
  (datakits, getListSelector, getRetrieveSelector) => (
    datakitId: string,
    loadAll: boolean = false
  ) => {
    if (!datakits[datakitId]) {
      throw new Error(`cannot find '${datakitId}'`);
    }
    const { query, endpoint, type, filter } = datakits[datakitId];
    const listSelector = getListSelector(type);
    const retrieveSelector = getRetrieveSelector(type);

    const result = (() => {
      switch (endpoint) {
        case 'list':
          return listSelector(query, loadAll);
        case 'retrieve':
          return retrieveSelector(query);
        default:
          throw new Error(`Unsupported endpoint: ${endpoint}`);
      }
    })();

    const filterFn = filters[filter || 'missingAssetId'];
    const items = (result.items as any[]).filter(
      filterFn
    ) as typeof result.items;
    return {
      ...result,
      items,
    };
  }
);

export const dataKitItemsSelectorFactory = (
  datakitId: string,
  all: boolean = false
) => {
  return (state: RootState) => {
    const { type, endpoint, query } = state.selection.items[datakitId];
    const key = JSON.stringify({ ...query, all });
    const { items } = state[type].items;
    switch (endpoint) {
      case 'list': {
        const partitions = state[type]?.list[key] || {};
        const ids = Object.values(partitions).reduce(
          (accl, partition) => accl.concat(partition.ids || []),
          [] as number[]
        );
        return ids.map(i => items.get(i)).filter(Boolean);
      }
      case 'retrieve': {
        const ids = query.map((i: any) => i.id || -1) as number[];
        return ids.map(i => items.get(i)).filter(Boolean);
      }
      default: {
        throw new Error('Unsupported endpoint');
      }
    }
  };
};

export const dataKitItemMapSelector = createSelector(
  dataKitItemsSelector,
  dataKitSelector => (datakitId: string, loadAll: boolean = false) => {
    const resource = dataKitSelector(datakitId, loadAll);

    // @ts-ignore
    resource.items = resource.items.reduce((accl, i) => {
      accl[i.id] = i;
      return accl;
    }, {});
    return resource;
  }
);

export const dataKitCountSelector = (datakitId: string) =>
  createSelector(
    (state: RootState) => state.selection.items,
    getCountsSelector,
    (datakits, countSelector) => {
      const { type, query, endpoint } = datakits[datakitId];
      switch (endpoint) {
        case 'list': {
          return countSelector(type)(query)?.count || 0;
        }
        case 'retrieve': {
          return query?.length || 0;
        }
        default: {
          throw new Error('Unsupported endpoint');
        }
      }
    }
  );
