import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import { list as listFiles } from 'modules/files';
import {
  list as listAssets,
  listParallel as listAssetsParallel,
} from 'modules/assets';
import { ResourceSelection } from './types';
import { getCountAction, getRetrieveAction } from './helpers';

interface SelectionState {
  active: {
    [resourceType: string]: string;
  };
  items: {
    [kitId: string]: ResourceSelection;
  };
  error: boolean;
  localStorage: any;
}
const initialState: SelectionState = {
  active: {},
  items: {},
  localStorage: { version: 1 },
  error: false,
};

// -------------------------------------------------------------
// ------------------------ SELECTION --------------------------
// -------------------------------------------------------------

export const loadResourceSelection = createAsyncThunk(
  'selection/load',
  async (
    { selectionId, loadAll = true }: { selectionId: string; loadAll?: boolean },
    { dispatch, getState }: { dispatch: any; getState: () => any }
  ) => {
    const selection = getState().selection.items[selectionId];

    if (!selection) throw Error();

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
            await dispatch(
              listFiles({ filter: selection.query, all: loadAll })
            );
            break;
          case 'assets': {
            if (loadAll) {
              await dispatch(listAssetsParallel(selection.query));
              break;
            }
            await dispatch(listAssets(selection.query));
            break;
          }
        }
      }
    }
  }
);

export const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    createSelection: (state, action) => {
      const { type, endpoint, query, filter = 'none' } = action.payload;
      const id: string = uuid();
      const selection = { id, type, endpoint, query, filter };
      state.items[id] = selection;
      state.active[type] = id;
    },
    updateSelection: (state, action) => {
      const {
        update: { id, filter },
      } = action.payload;
      if (state.items[id]) {
        if ('filter' in action.payload) {
          state.items[id].filter = filter;
        }
      }
    },
    selectionError: (state) => {
      state.error = true;
    },
    importLocalStorageContent: (state, action) => {
      const { items, version } = action.payload;
      if (version === CURRENT_LS_VERSION && Object.keys(items).length > 0)
        state.items = items;
      else state.localStorage.error = 'LS_DATA_IMCOMPATIBLE_OR_MISSING';
    },
  },

  // [todo]
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(loadResourceSelection.pending, (state, action) => {})
  //     .addCase(loadResourceSelection.rejected, (state, action) => {})
  //     .addCase(loadResourceSelection.fulfilled, (state, action) => {});
  // },
});

// -------------------------------------------------------------
// ---------------------- LOCAL STORAGE ------------------------
// -------------------------------------------------------------

export type LSSelection = {
  items: {
    [key: string]: ResourceSelection;
  };
  version: number;
};

const CURRENT_LS_VERSION = 1;

export function getLocalStorageContent(state: SelectionState): LSSelection {
  return {
    items: state.items,
    version: CURRENT_LS_VERSION,
  };
}

export const { reducer } = selectionSlice;
export const {
  createSelection,
  updateSelection,
  importLocalStorageContent,
} = selectionSlice.actions;

export * from './selectors';
export * from './types';
