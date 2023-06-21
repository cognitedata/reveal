import {
  createSlice,
  PayloadAction,
  isFulfilled,
  isAnyOf,
  createAction,
} from '@reduxjs/toolkit';

import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { FetchFilesById } from 'src/store/thunks/Files/FetchFilesById';
import { UpdateFiles } from 'src/store/thunks/Files/UpdateFiles';
import { clearFileState } from 'src/store/commonActions';
import { makeReducerSelectAllFilesWithFilter } from 'src/store/commonReducers';
import { SelectFilter } from 'src/modules/Common/types';
import { FileState, VisionFile } from './types';
import { clearFilesState, deleteFileById, updateFileState } from './utils';

// other actions
export const setSelectedAllFiles = createAction<{
  selectStatus: boolean;
  filter?: SelectFilter;
  overridedFileIds?: number[];
}>('setSelectedAllFiles');

export const initialState: FileState = {
  dataSetIds: undefined,
  extractExif: true,
  files: {
    byId: {},
    allIds: [],
    selectedIds: [],
  },
};

const filesSlice = createSlice({
  name: 'filesSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    addFiles: {
      prepare: (files: VisionFile[]) => {
        return { payload: files };
      },
      reducer: (state, action: PayloadAction<VisionFile[]>) => {
        const files = action.payload;

        files.forEach((file) => {
          updateFileState(state, file);
        });
      },
    },
    setDataSetIds(state, action: PayloadAction<number[] | undefined>) {
      state.dataSetIds = action.payload;
    },
    setExtractExif(state, action: PayloadAction<boolean>) {
      state.extractExif = action.payload;
    },
    setFileSelectState: {
      prepare: (id: number, selected: boolean) => {
        return { payload: { fileId: id, selectState: selected } };
      },
      reducer: (
        state,
        action: PayloadAction<{ fileId: number; selectState: boolean }>
      ) => {
        const { fileId } = action.payload;
        if (fileId) {
          const alreadySelected = state.files.selectedIds.includes(fileId);
          if (alreadySelected) {
            const index = state.files.selectedIds.findIndex(
              (id) => id === fileId
            );
            state.files.selectedIds.splice(index, 1);
          } else {
            state.files.selectedIds.push(fileId);
          }
        }
      },
    },
    setSelectedFiles: {
      prepare: (id: number[]) => {
        return { payload: { fileIds: id } };
      },
      reducer: (state, action: PayloadAction<{ fileIds: number[] }>) => {
        const { fileIds } = action.payload;
        state.files.selectedIds = fileIds;
      },
    },
    clearState(state, action: PayloadAction<number[]>) {
      // TODO: is this even in use?
      if (action.payload && action.payload.length) {
        action.payload.forEach((fileId) => {
          deleteFileById(state, fileId);
        });
      } else {
        clearFilesState(state);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setSelectedAllFiles, makeReducerSelectAllFilesWithFilter());

    builder.addMatcher(
      isAnyOf(DeleteFilesById.fulfilled, clearFileState),
      (state, action) => {
        action.payload.forEach((fileId) => {
          deleteFileById(state, fileId);
        });
      }
    );

    builder.addMatcher(
      isFulfilled(FetchFilesById, UpdateFiles),
      (state, { payload }) => {
        payload.forEach((fileState) => {
          updateFileState(state, fileState);
        });
      }
    );
  },
});

export const {
  addFiles,
  setDataSetIds,
  setExtractExif,
  setFileSelectState,
  setSelectedFiles,
  clearState,
} = filesSlice.actions;

export default filesSlice.reducer;
