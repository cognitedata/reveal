import { Store, combineReducers, AnyAction } from 'redux';
import app from 'modules/app';
import assets from 'modules/assets';
import dataSets from 'modules/datasets';
import timeseries from 'modules/timeseries';
import events from 'modules/events';
import files from 'modules/files';
import fileContextualization from 'modules/fileContextualization';
import selection, {
  getLocalStorageContent as selectionLSContent,
  importLocalStorageContent as selectionLSImport,
  LSSelection,
} from 'modules/selection';
import annotations from 'modules/annotations';
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
    selection,
    sequences,
  });

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

export default createRootReducer;

export function persistedState(state: RootState) {
  return {
    selection: selectionLSContent(state.selection),
  };
}

type LSStorage = {
  selection: LSSelection;
};
export function loadLocalStorage(key: string, store: Store<any, AnyAction>) {
  try {
    const localStorageContent = JSON.parse(
      localStorage.getItem(key) || '{}'
    ) as LSStorage;
    store.dispatch(selectionLSImport(localStorageContent.selection));
  } catch ({ message }) {
    store.dispatch({ type: 'global/LOCAL_STORAGE_ERROR', message });
  }
}
