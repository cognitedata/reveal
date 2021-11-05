import {
  createAction,
  createSelector,
  createSlice,
  isAnyOf,
  PayloadAction,
} from '@reduxjs/toolkit';
import { FileState } from 'src/modules/Common/store/filesSlice';
import { SelectFilter, ViewMode } from 'src/modules/Common/types';
import {
  FileGeoLocation,
  FileInfo,
  Label,
  Metadata,
} from '@cognite/cdf-sdk-singleton';
import { clearExplorerFileState } from 'src/store/commonActions';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { UpdateFiles } from 'src/store/thunks/Files/UpdateFiles';
import { createFileInfo, createFileState } from 'src/store/util/StateUtils';
import { makeReducerSelectAllFilesWithFilter } from 'src/store/commonReducers';
import { DEFAULT_PAGE_SIZE } from 'src/constants/PaginationConsts';
import { VisionFileFilterProps } from 'src/modules/Explorer/Components/Filters/types';
import { GenericSort, SorterNames } from 'src/modules/Common/Utils/SortUtils';
import { RootState } from 'src/store/rootReducer';
import { SortPaginate } from 'src/modules/Common/Components/FileTable/types';

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
  focusedFileId: number | null;
  showFileMetadata: boolean;
  query: string;
  currentView: ViewMode;
  mapTableTabKey: string;
  filter: VisionFileFilterProps;
  showFilter: boolean;
  showFileUploadModal: boolean;
  files: {
    byId: Record<number, ExplorerFileState>;
    allIds: number[];
    selectedIds: number[];
  };
  uploadedFileIds: number[];
  sortMeta: SortPaginate;
  loadingAnnotations?: boolean;
  // Creating a separate state to make it not affected by preserved state in local storage
  exploreModal: {
    filter: VisionFileFilterProps;
    query: string;
    focusedFileId: number | null;
  };
  isLoading: boolean;
  percentageScanned: number;
};

const initialState: State = {
  focusedFileId: null,
  showFileMetadata: false,
  query: '',
  currentView: 'list',
  mapTableTabKey: 'fileInMap',
  filter: {},
  showFilter: true,
  showFileUploadModal: false,
  files: {
    byId: {},
    allIds: [],
    selectedIds: [],
  },
  uploadedFileIds: [],
  sortMeta: {
    sortKey: '',
    reverse: false,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  loadingAnnotations: false,
  exploreModal: {
    filter: {},
    query: '',
    focusedFileId: null,
  },
  isLoading: false,
  percentageScanned: 0,
};

export const setSelectedAllExplorerFiles = createAction<{
  selectStatus: boolean;
  filter?: SelectFilter;
}>('setSelectedAllExplorerFiles');

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
        resetFileState(state);

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
    setExplorerSelectedFiles: {
      prepare: (id: number[]) => {
        return { payload: { fileIds: id } };
      },
      reducer: (state, action: PayloadAction<{ fileIds: number[] }>) => {
        const { fileIds } = action.payload;
        state.files.selectedIds = fileIds;
      },
    },
    setExplorerFocusedFileId(state, action: PayloadAction<number | null>) {
      state.focusedFileId = action.payload;
    },
    setExplorerModalFocusedFileId(state, action: PayloadAction<number | null>) {
      state.exploreModal.focusedFileId = action.payload;
    },
    hideExplorerFileMetadata(state) {
      state.showFileMetadata = false;
    },
    showExplorerFileMetadata(state) {
      state.showFileMetadata = true;
    },
    setExplorerQueryString(state, action: PayloadAction<string>) {
      if (state.query !== action.payload) resetSortKey(state);
      state.query = action.payload;
    },
    setExplorerModalQueryString(state, action: PayloadAction<string>) {
      if (state.exploreModal.query !== action.payload) resetSortKey(state);
      state.exploreModal.query = action.payload;
    },
    setExplorerFilter(state, action: PayloadAction<VisionFileFilterProps>) {
      if (state.filter !== action.payload) resetSortKey(state);
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
    setSortKey(state, action: PayloadAction<string>) {
      state.sortMeta.sortKey = action.payload;
    },
    setReverse(state, action: PayloadAction<boolean>) {
      state.sortMeta.reverse = action.payload;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.sortMeta.currentPage = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.sortMeta.pageSize = action.payload;
    },
    setExplorerCurrentView(state, action: PayloadAction<ViewMode>) {
      state.currentView = action.payload;
    },
    setLoadingAnnotations(state) {
      state.loadingAnnotations = true;
    },
    setMapTableTabKey(
      state,
      action: PayloadAction<{
        mapTableTabKey: string;
      }>
    ) {
      state.mapTableTabKey = action.payload.mapTableTabKey;
    },
    addExplorerUploadedFileId(state, action: PayloadAction<number>) {
      state.uploadedFileIds.push(action.payload);
    },
    resetExplorerTemporaryState(state) {
      state.focusedFileId = null;
      state.uploadedFileIds = [];
      state.showFileUploadModal = false;
      state.loadingAnnotations = false;
      resetFileState(state);
    },
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setPercentageScanned(state, action: PayloadAction<number>) {
      state.percentageScanned = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(UpdateFiles.fulfilled, (state, { payload }) => {
      payload.forEach((fileState) => {
        updateFileState(state, fileState);
      });
    });

    builder.addCase(
      setSelectedAllExplorerFiles,
      makeReducerSelectAllFilesWithFilter()
    );

    builder.addCase(
      RetrieveAnnotations.fulfilled,
      (state: State, { payload: _ }) => {
        state.loadingAnnotations = false;
      }
    );

    builder.addMatcher(
      isAnyOf(DeleteFilesById.fulfilled, clearExplorerFileState),
      (state, action) => {
        action.payload.forEach((fileId) => {
          deleteFileById(state, fileId);
          state.files.selectedIds = state.files.selectedIds.filter(
            (id) => id !== fileId
          );
          state.uploadedFileIds = state.uploadedFileIds.filter(
            (id) => id !== fileId
          );
        });
      }
    );
  },
});

export type { State as ExplorerReducerState };
export { initialState as explorerReducerInitialState };

export const {
  setExplorerFiles,
  setExplorerFileSelectState,
  setExplorerSelectedFiles,
  setExplorerFocusedFileId,
  setExplorerModalFocusedFileId,
  hideExplorerFileMetadata,
  showExplorerFileMetadata,
  setExplorerQueryString,
  setExplorerModalQueryString,
  setExplorerFilter,
  toggleExplorerFilterView,
  setExplorerFileUploadModalVisibility,
  setSortKey,
  setReverse,
  setCurrentPage,
  setPageSize,
  setExplorerCurrentView,
  setMapTableTabKey,
  setLoadingAnnotations,
  addExplorerUploadedFileId,
  resetExplorerTemporaryState,
  setIsLoading,
  setPercentageScanned,
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

export const selectExplorerFilesWithAnnotationCount = createSelector(
  (state: RootState) => selectExplorerAllFiles(state.explorerReducer),
  (state: RootState) => state.annotationReducer.files.byId,
  (explorerAllFiles, allAnnotationFiles) => {
    return explorerAllFiles.map((file) => {
      return {
        ...file,
        annotationCount: allAnnotationFiles[file.id]
          ? allAnnotationFiles[file.id].length
          : 0,
      };
    });
  }
);

export const selectExplorerSortedFiles = createSelector(
  selectExplorerFilesWithAnnotationCount,
  (rootState: RootState) => rootState.explorerReducer.sortMeta.sortKey,
  (rootState: RootState) => rootState.explorerReducer.sortMeta.reverse,
  GenericSort
);

export const selectExplorerSelectedFileIdsInSortedOrder = createSelector(
  selectExplorerSortedFiles,
  (rootState: RootState) =>
    selectExplorerSelectedIds(rootState.explorerReducer),
  (sortedFiles, selectedIds) => {
    const indexMap = new Map<number, number>(
      sortedFiles.map((item, index) => [item.id, index])
    );

    const sortedIds = GenericSort(
      selectedIds,
      SorterNames.indexInSortedArray,
      false,
      indexMap
    );

    return sortedIds;
  }
);

export const selectExplorerAllSelectedFilesInSortedOrder = createSelector(
  selectExplorerSelectedFileIdsInSortedOrder,
  (rootState: RootState) => rootState.explorerReducer.files.byId,
  (sortedSelectedFileIds, allFiles) => {
    return sortedSelectedFileIds.map((id) => allFiles[id]);
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

const resetFileState = (state: State) => {
  state.files.byId = {};
  state.files.allIds = [];
  state.files.selectedIds = [];
};

const convertToExplorerFileState = (
  fileState: FileState
): ExplorerFileState => {
  return { ...fileState };
};

const resetSortKey = (state: State) => {
  // Workaround: rest sortKey, since annotations need to be refetched
  state.sortMeta.sortKey = '';
};
