import { combineReducers } from 'redux';
import app from 'modules/app';
import assets from 'modules/assets';
import dataSets from 'modules/datasets';
import timeseries from 'modules/timeseries';
import events from 'modules/events';
import files from 'modules/files';
import fileContextualization from 'modules/fileContextualization';
import annotations from 'modules/annotations';
import selection from 'modules/selection';
import sequences from 'modules/sequences';

const createRootReducer = () =>
  combineReducers({
    annotations,
    app,
    assets,
    dataSets,
    timeseries,
    events,
    files,
    fileContextualization,
    sequences,
    selection,
  });

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

export default createRootReducer;
