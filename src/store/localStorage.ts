import { Store, AnyAction } from 'redux';
import {
  getLocalStorageContent as selectionLSContent,
  importLocalStorageContent as selectionLSImport,
  LSSelection,
} from 'modules/workflows';
import { RootState } from '.';

type LSStorage = {
  selection: LSSelection;
};

export function persistedState(state: RootState) {
  return {
    selection: selectionLSContent(state.workflows),
  };
}

export function loadLocalStorage(key: string, store: Store<any, AnyAction>) {
  try {
    const localStorageContent = JSON.parse(
      localStorage.getItem(key) || '{}'
    ) as LSStorage;
    store.dispatch(selectionLSImport(localStorageContent.selection));
  } catch ({ message }) {
    store.dispatch({ type: 'global/localStorage/error', message });
  }
}
