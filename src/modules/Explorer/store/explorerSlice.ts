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
import { DEFAULT_PAGE_SIZE } from 'src/constants/PaginationConsts';
import { SortPaginate } from 'src/modules/Common/Components/FileTable/types';

export enum ExploreSortPaginateType {
  list = 'LIST',
  grid = 'GRID',
  mapLocation = 'LOCATION',
  mapNoLocation = 'NO_LOCATION',
  modal = 'MODAL',
}

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

export type BulkEditTempState = {
  metadata?: Metadata;
  keepOriginalMetadata?: Boolean;
  labels?: Label[];
};

export type State = {
  selectedFileId: number | null;
  showFileMetadata: boolean;
  query: string;
  currentView: ViewMode;
  mapTableTabKey: string;
  filter: FileFilterProps;
  showFilter: boolean;
  showFileUploadModal: boolean;
  showFileDownloadModal: boolean;
  showBulkEditModal: boolean;
  files: {
    byId: Record<number, ExplorerFileState>;
    allIds: number[];
    selectedIds: number[];
  };
  sortPaginate: Record<ExploreSortPaginateType, SortPaginate>;
  bulkEditTemp: BulkEditTempState;
};

const initialState: State = {
  selectedFileId: null,
  showFileMetadata: false,
  query: '',
  currentView: 'list',
  mapTableTabKey: 'fileInMap',
  filter: {},
  showFilter: true,
  showFileUploadModal: false,
  showFileDownloadModal: false,
  showBulkEditModal: false,
  files: {
    byId: {},
    allIds: [],
    selectedIds: [],
  },
  sortPaginate: {
    LIST: { currentPage: 1, pageSize: DEFAULT_PAGE_SIZE },
    GRID: { currentPage: 1, pageSize: DEFAULT_PAGE_SIZE },
    LOCATION: { currentPage: 1, pageSize: DEFAULT_PAGE_SIZE },
    NO_LOCATION: { currentPage: 1, pageSize: DEFAULT_PAGE_SIZE },
    MODAL: { currentPage: 1, pageSize: DEFAULT_PAGE_SIZE },
  },
  bulkEditTemp: {},
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
    setExplorerSelectedFileId(state, action: PayloadAction<number | null>) {
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
    setBulkEditModalVisibility(state, action: PayloadAction<boolean>) {
      state.showBulkEditModal = action.payload;
    },
    setSortKey(
      state,
      action: PayloadAction<{ type: ExploreSortPaginateType; sortKey: string }>
    ) {
      const { type, sortKey } = action.payload;
      state.sortPaginate[type] = { ...state.sortPaginate[type], sortKey };
    },
    setReverse(
      state,
      action: PayloadAction<{ type: ExploreSortPaginateType; reverse: boolean }>
    ) {
      const { type, reverse } = action.payload;
      state.sortPaginate[type] = { ...state.sortPaginate[type], reverse };
    },
    setCurrentPage(
      state,
      action: PayloadAction<{
        type: ExploreSortPaginateType;
        currentPage: number;
      }>
    ) {
      const { type, currentPage } = action.payload;
      state.sortPaginate[type] = { ...state.sortPaginate[type], currentPage };
    },
    setPageSize(
      state,
      action: PayloadAction<{
        type: ExploreSortPaginateType;
        pageSize: number;
      }>
    ) {
      const { type, pageSize } = action.payload;
      state.sortPaginate[type] = { ...state.sortPaginate[type], pageSize };
    },
    setExplorerCurrentView(state, action: PayloadAction<ViewMode>) {
      state.currentView = action.payload;
    },
    setMapTableTabKey(
      state,
      action: PayloadAction<{
        mapTableTabKey: string;
      }>
    ) {
      state.mapTableTabKey = action.payload.mapTableTabKey;
    },
    setBulkEditTemp(state, action: PayloadAction<BulkEditTempState>) {
      state.bulkEditTemp = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteFilesById.fulfilled, (state, { payload }) => {
      payload.forEach((fileId) => {
        deleteFileById(state, fileId.id);
        state.files.selectedIds = state.files.selectedIds.filter(
          (id) => id !== fileId.id
        );
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
  toggleExplorerFilterView,
  setExplorerFileUploadModalVisibility,
  setExplorerFileDownloadModalVisibility,
  setBulkEditModalVisibility,
  setSortKey,
  setReverse,
  setCurrentPage,
  setPageSize,
  setExplorerCurrentView,
  setMapTableTabKey,
  setBulkEditTemp,
} = explorerSlice.actions;

export default explorerSlice.reducer;

// selectors
export const selectExplorerSelectedIds = (state: State): number[] =>
  state.files.selectedIds;

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
  state.files.selectedIds = [];
};

const convertToExplorerFileState = (
  fileState: FileState
): ExplorerFileState => {
  return { ...fileState };
};
