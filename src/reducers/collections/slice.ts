import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  Update,
} from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { LoadingStatus } from 'reducers/types';
import { ValueOf } from 'typings/utils';
import { Collection } from './types';

const collectionAdapter = createEntityAdapter<Collection>({
  selectId: (collection) => collection.id,
});

const collectionsSlice = createSlice({
  name: 'collections',
  initialState: collectionAdapter.getInitialState({
    status: { status: 'IDLE' } as LoadingStatus,
    initialized: false,
    isVisible: false,
  }),
  reducers: {
    showCollections: (state) => {
      state.isVisible = true;
    },
    hideCollections: (state) => {
      state.isVisible = false;
    },
    // Loading collection
    startLoadingAllCollections: (state) => {
      state.status.status = 'LOADING';
    },
    finishedLoadingAllCollections: (
      state,
      action: PayloadAction<Collection[]>
    ) => {
      state.status.status = 'SUCCESS';
      state.initialized = true;
      collectionAdapter.setAll(state, action.payload);
    },
    failedLoadingAllCollections: (state, action: PayloadAction<string>) => {
      state.status.status = 'FAILED';
      state.initialized = true;
      state.status.error = action.payload;
    },

    // Editing collection (add/remove resources)
    updateCollection: (state, action: PayloadAction<Update<Collection>>) => {
      collectionAdapter.updateOne(state, action.payload);
    },

    // Making new collection
    startStoringNewCollection: (state) => {
      state.status.status = 'LOADING';
    },
    storedNewCollection: (state, action: PayloadAction<Collection>) => {
      state.status.status = 'SUCCESS';
      collectionAdapter.addOne(state, action.payload);
    },
    failedStoringNewCollection: (state, action: PayloadAction<string>) => {
      state.status.status = 'FAILED';
      state.status.error = action.payload;
    },
  },
});

export default collectionsSlice;

export type CollectionAction = ReturnType<
  ValueOf<typeof collectionsSlice.actions>
>;
export type CollectionState = ReturnType<typeof collectionsSlice.reducer>;

export const collectionsSelectors = collectionAdapter.getSelectors<RootState>(
  (state) => state.collections
);
