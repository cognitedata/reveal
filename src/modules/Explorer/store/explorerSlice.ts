import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ViewMode } from 'src/modules/Common/types';
import {
  FileFilterProps,
  FileGeoLocation,
  FileInfo,
  Label,
  Metadata,
} from '@cognite/cdf-sdk-singleton';
import { createFileInfo, createFileState } from 'src/store/util/StateUtils';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import { FileState } from 'src/modules/Common/filesSlice';
import { setSelectedAllFiles } from 'src/store/commonActions';
import { makeReducerSelectAllFilesWithFilter } from 'src/store/commonReducers';

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
  geoLocation?: FileGeoLocation;
};

export type State = {
  selectedFileId: number | null;
  showFileMetadata: boolean;
  query: string;
  currentView: ViewMode;
  filter: FileFilterProps;
  showFilter: boolean;
  showFileUploadModal: boolean;
  showFileDownloadModal: boolean;
  selectedIds: number[];
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
  showFileDownloadModal: false,
  files: {
    byId: {},
    allIds: [],
  },
  selectedIds: [],
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
          const alreadySelected = state.selectedIds.includes(fileId);
          if (alreadySelected) {
            const index = state.selectedIds.findIndex((id) => id === fileId);
            state.selectedIds.splice(index, 1);
          } else {
            state.selectedIds.push(fileId);
          }
        }
      },
    },
    setExplorerSelectedFileId(state, action: PayloadAction<number>) {
      state.selectedFileId = action.payload;
    },
    hideExplorerFileMetadata(state) {
      state.showFileMetadata = false;
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
    setExplorerFileDownloadModalVisibility(
      state,
      action: PayloadAction<boolean>
    ) {
      state.showFileDownloadModal = action.payload;
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
    });

    builder.addCase(setSelectedAllFiles, makeReducerSelectAllFilesWithFilter());
  },
});

export const {
  setExplorerFiles,
  setExplorerFileSelectState,
  setExplorerSelectedFileId,
  hideExplorerFileMetadata,
  showExplorerFileMetadata,
  setExplorerQueryString,
  setExplorerFilter,
  setExplorerCurrentView,
  toggleExplorerFilterView,
  setExplorerFileUploadModalVisibility,
  setExplorerFileDownloadModalVisibility,
} = explorerSlice.actions;

export default explorerSlice.reducer;

// selectors
export const selectExplorerSelectedIds = (state: State): number[] =>
  state.selectedIds;

export const selectExploreFileCount = (state: State): number =>
  state.files.allIds.length;

export const selectExplorerAllFiles = createSelector(
  (state: State) => state.files.allIds,
  (state) => state.files.byId,
  (allIds, allFiles) => {
    return allIds.map((id) => createFileInfo(allFiles[id]));
  }
);

export const selectExplorerAllFilesSelected = createSelector(
  (state: State) => state.files.allIds,
  selectExplorerSelectedIds,
  (allIds, selectedFileIds) => {
    return (
      !!allIds.length && allIds.every((id) => selectedFileIds.includes(id))
    );
  }
);

export const selectExplorerAllSelectedFiles = createSelector(
  selectExplorerSelectedIds,
  (state) => state.files.byId,
  (selectedIds, allFiles) => {
    return selectedIds.map((fileId) => allFiles[fileId]);
  }
);

export const selectExplorerSelectedFileIds = createSelector(
  selectExplorerAllSelectedFiles,
  (files) => files.map((file) => file.id)
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
  state.selectedIds = [];
};

const convertToExplorerFileState = (
  fileState: FileState
): ExplorerFileState => {
  return { ...fileState };
};
