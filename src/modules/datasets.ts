import zipObject from 'lodash/zipObject';
import { createSelector } from 'reselect';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { batch } from 'react-redux';
import { DataSet, DataSetFilterRequest } from '@cognite/sdk';
import { RootState } from 'reducers';
import { count as countTimeseries } from 'modules/timeseries';
import { count as countAssets } from 'modules/assets';
import { count as countFiles } from 'modules/files';
import { count as countSequences } from 'modules/sequences';
import sdk from 'sdk-singleton';
import { followCursors } from 'helpers';

const LIST = 'datasets/LIST';
const LIST_DONE = 'datasets/LIST_DONE';
const LIST_ERROR = 'datasets/LIST_ERROR';

export interface DataSetStore {
  items: { [key: number]: DataSet };
  fetching: boolean;
  done: boolean;
  error: boolean;
}

const initialState = {
  items: {},
  resourceCount: {},
  fetching: false,
  done: false,
  error: false,
};

interface ListAction extends Action<typeof LIST> {}

interface ListDoneAction extends Action<typeof LIST_DONE> {
  result: DataSet[];
}

interface ListErrorAction extends Action<typeof LIST_ERROR> {}
type ListActions = ListAction | ListDoneAction | ListErrorAction;

type Actions = ListActions;

export function list() {
  return async (
    dispatch: ThunkDispatch<any, any, AnyAction>,
    getState: () => RootState
  ) => {
    const { fetching, done } = getState().dataSets;
    if (fetching || done) {
      return;
    }

    dispatch({
      type: LIST,
    });

    try {
      const { items } = await followCursors<DataSetFilterRequest, DataSet>(
        {},
        sdk.datasets.list
      );

      // Only keep un-archived datasets
      items.filter(
        (dataset: DataSet) => dataset?.metadata?.archived === 'false'
      );
      batch(() => {
        items.map((dataSet: DataSet) => dispatch(getResourceCount(dataSet.id)));
      });

      dispatch({
        type: LIST_DONE,
        result: items,
      });
    } catch (e) {
      dispatch({
        type: LIST_ERROR,
      });
    }
  };
}

export function getResourceCount(id: number) {
  return async (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    const filter = { filter: { dataSetIds: [{ id }] } };
    batch(() => {
      dispatch(countAssets(filter));
      dispatch(countTimeseries(filter));
      dispatch(countFiles(filter));
      dispatch(countSequences(filter));
    });
  };
}

function mergeDataSets(
  dataSets: { [key: number]: DataSet },
  newDataSets: DataSet[]
): { [key: number]: DataSet } {
  const ids = newDataSets.map(a => a.id);
  return {
    ...dataSets,
    ...zipObject(ids, newDataSets),
  };
}

export default function reducer(
  state: DataSetStore = initialState,
  action: Actions
): DataSetStore {
  switch (action.type) {
    case LIST: {
      return {
        ...state,
        fetching: true,
      };
    }

    case LIST_DONE: {
      return {
        ...state,
        items: mergeDataSets(state.items, action.result),
        done: true,
        error: false,
        fetching: false,
      };
    }

    case LIST_ERROR: {
      return {
        ...state,
        error: true,
        fetching: false,
      };
    }
    default: {
      return state;
    }
  }
}

type DataSetCount = {
  [key: number]: {
    timeseries: number;
    files: number;
    assets: number;
    events: number;
    sequences: number;
  };
};

// Selectors
export const dataSetCounts = createSelector(
  (state: RootState) => state.dataSets.items,
  (state: RootState) => state.assets.count,
  (state: RootState) => state.timeseries.count,
  (state: RootState) => state.files.count,
  (state: RootState) => state.events.count,
  (state: RootState) => state.sequences.count,
  (
    datasets,
    assetCounts,
    timeseriesCounts,
    fileCounts,
    eventCounts,
    sequenceCounts
  ) => {
    return Object.values(datasets).reduce((accl, dataset) => {
      const key = JSON.stringify({
        filter: { dataSetIds: [{ id: dataset.id }] },
      });
      accl[dataset.id] = {
        timeseries: (timeseriesCounts[key] && timeseriesCounts[key].count) || 0,
        files: (fileCounts[key] && fileCounts[key].count) || 0,
        assets: (assetCounts[key] && assetCounts[key].count) || 0,
        events: (eventCounts[key] && eventCounts[key].count) || 0,
        sequences: (sequenceCounts[key] && sequenceCounts[key].count) || 0,
      };
      return accl;
    }, {} as DataSetCount) as DataSetCount;
  }
);
export const dataSetCount = createSelector(dataSetCounts, counts => {
  return (id: number) => counts[id];
});

export const dataSetSelector = (id: number) => (
  state: RootState
): DataSet | undefined => state.dataSets.items[id];

export const selectAllDataSets = (state: RootState): DataSet[] =>
  Object.values(state.dataSets.items);

export const privateThingsToBeTested = {
  mergeDataSets,
};
