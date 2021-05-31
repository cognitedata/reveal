import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ViewMode } from 'src/modules/Common/types';
import {
  FileFilterProps,
  FileInfo,
  Label,
  Metadata,
} from '@cognite/cdf-sdk-singleton';
import { createFileInfo, createFileState } from 'src/store/util/StateUtils';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import { ToastUtils } from 'src/utils/ToastUtils';
import { FileState } from 'src/modules/Common/filesSlice';

export type ExplorerFileState = {
  id: number;
  createdTime: number;
  lastUpdatedTime: number;
  sourceCreatedTime?: number;
  mimeType?: string;
  name: string;
  source?: string;
  uploaded: boolean;
  uploadedTime?: number;
  labels?: Label[];
  metadata?: Metadata;
  linkedAnnotations: string[];
  assetIds?: number[];
  selected: boolean;
};

export type State = {
  selectedFileId: number | null;
  showFileMetadata: boolean;
  query: string;
  currentView: ViewMode;
  filter: FileFilterProps;
  showFilter: boolean;
  showFileUploadModal: boolean;
  files: {
    byId: Record<number, ExplorerFileState>;
    allIds: number[];
  };
};

const initialState: State = {
  selectedFileId: null,
  showFileMetadata: false,
  query: '',
  currentView: 'list',
  filter: {},
  showFilter: true,
  showFileUploadModal: false,
  files: {
    byId: {},
    allIds: [],
  },
};

const explorerSlice = createSlice({
  name: 'explorerSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    setExplorerFiles: {
      prepare: (files: FileInfo[]) => {
        return {
          payload: files.map(
            (file) => createFileState(file) as ExplorerFileState
          ),
        };
      },
      reducer: (state, action: PayloadAction<ExplorerFileState[]>) => {
        const files = action.payload;
        clearFileState(state);

        files.forEach((file) => {
          updateFileState(state, file);
        });
      },
    },
    setExplorerFileSelectState: {
      prepare: (id: number, selected: boolean) => {
        return { payload: { fileId: id, selectState: selected } };
      },
      reducer: (
        state,
        action: PayloadAction<{ fileId: number; selectState: boolean }>
      ) => {
        const { fileId } = action.payload;
        if (fileId) {
          const file = state.files.byId[fileId];
          if (file) {
            file.selected = action.payload.selectState;
          }
        }
      },
    },
    setExplorerAllFilesSelectState(state, action: PayloadAction<boolean>) {
      const allFileIds = state.files.allIds;
      allFileIds.forEach((fileId) => {
        const file = state.files.byId[fileId];
        file.selected = action.payload;
      });
    },
    setExplorerSelectedFileId(state, action: PayloadAction<number>) {
      state.selectedFileId = action.payload;
    },
    toggleExplorerFileMetadata(state) {
      state.showFileMetadata = !state.showFileMetadata;
    },
    showExplorerFileMetadata(state) {
      state.showFileMetadata = true;
    },
    setExplorerQueryString(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setExplorerFilter(state, action: PayloadAction<FileFilterProps>) {
      state.filter = action.payload;
    },
    setExplorerCurrentView(state, action: PayloadAction<ViewMode>) {
      state.currentView = action.payload;
    },
    toggleExplorerFilterView(state) {
      state.showFilter = !state.showFilter;
    },
    setExplorerFileUploadModalVisibility(
      state,
      action: PayloadAction<boolean>
    ) {
      state.showFileUploadModal = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteFilesById.fulfilled, (state, { payload }) => {
      payload.forEach((fileId) => {
        deleteFileById(state, fileId.id);
      });
    });

    builder.addCase(UpdateFiles.fulfilled, (state, { payload }) => {
      payload.forEach((fileState) => {
        updateFileState(state, fileState);
      });

      if (payload.length) {
        ToastUtils.onSuccess('File updated successfully!');
      }
    });

    builder.addCase(UpdateFiles.rejected, (_, { error }) => {
      if (error && error.message) {
        ToastUtils.onFailure(error?.message);
      }
    });
  },
});

export const {
  setExplorerFiles,
  setExplorerFileSelectState,
  setExplorerAllFilesSelectState,
  setExplorerSelectedFileId,
  toggleExplorerFileMetadata,
  showExplorerFileMetadata,
  setExplorerQueryString,
  setExplorerFilter,
  setExplorerCurrentView,
  toggleExplorerFilterView,
  setExplorerFileUploadModalVisibility,
} = explorerSlice.actions;

export default explorerSlice.reducer;

// selectors

export const selectExplorerAllFiles = createSelector(
  (state: State) => state.files.allIds,
  (state) => state.files.byId,
  (allIds, allFiles) => {
    return allIds.map((id) => createFileInfo(allFiles[id]));
  }
);

export const selectExplorerAllFilesSelected = createSelector(
  (state: State) => state.files.allIds,
  (state) => state.files.byId,
  (allIds, allFiles) => {
    return allIds.length
      ? allIds.map((id) => allFiles[id]).every((item) => item.selected)
      : false;
  }
);

export const selectExplorerAllSelectedFiles = createSelector(
  selectExplorerAllFiles,
  (files) => {
    return files.filter((file) => file.selected);
  }
);

// state utility functions

const deleteFileById = (state: State, id: number) => {
  delete state.files.byId[id];
  state.files.allIds = Object.keys(state.files.byId).map((fid) => +fid);
};

const updateFileState = (state: State, file: FileState) => {
  const hasInState = !!state.files.byId[+file.id];
  state.files.byId[+file.id] = convertToExplorerFileState(file);
  if (!hasInState) {
    state.files.allIds.push(+file.id);
  }
};

const clearFileState = (state: State) => {
  state.files.byId = {};
  state.files.allIds = [];
};

const convertToExplorerFileState = (
  fileState: FileState
): ExplorerFileState => {
  return { ...fileState, id: +fileState.id };
};
