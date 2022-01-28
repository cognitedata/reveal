import {
  createAction,
  createSelector,
  isAnyOf,
  PayloadAction,
} from '@reduxjs/toolkit';
import { VisionFile } from 'src/modules/Common/store/files/types';
import { SelectFilter } from 'src/modules/Common/types';
import { FileGeoLocation, FileInfo, Label, Metadata } from '@cognite/sdk';
import { clearExplorerFileState } from 'src/store/commonActions';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { UpdateFiles } from 'src/store/thunks/Files/UpdateFiles';
import { createFileInfo, createFileState } from 'src/store/util/StateUtils';
import { makeReducerSelectAllFilesWithFilter } from 'src/store/commonReducers';
import { DEFAULT_PAGE_SIZE } from 'src/constants/PaginationConsts';
import { VisionFileFilterProps } from 'src/modules/FilterSidePanel/types';
import { GenericSort, SortKeys } from 'src/modules/Common/Utils/SortUtils';
import { RootState } from 'src/store/rootReducer';
import isEqual from 'lodash-es/isEqual';
import {
  createGenericTabularDataSlice,
  GenericTabularState,
} from 'src/store/genericTabularDataSlice';
import { useSelector } from 'react-redux';

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

export type State = GenericTabularState & {
  query: string;
  filter: VisionFileFilterProps;
  showFilter: boolean;
  showFileUploadModal: boolean;
  files: {
    byId: Record<number, ExplorerFileState>;
    allIds: number[];
    selectedIds: number[];
  };
  uploadedFileIds: number[];
  loadingAnnotations?: boolean;
  // Creating a separate state to make it not affected by preserved state in local storage
  exploreModal: {
    filter: VisionFileFilterProps;
    query: string;
    focusedFileId: number | null;
  };
  percentageScanned: number;
};

const initialState: State = {
  focusedFileId: null,
  showFileMetadata: false,
  currentView: 'list',
  mapTableTabKey: 'fileInMap',
  sortMeta: {
    sortKey: '',
    reverse: false,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    defaultTimestampKey: SortKeys.createdTime,
  },
  isLoading: false,
  query: '',
  filter: {},
  showFilter: true,
  showFileUploadModal: false,
  files: {
    byId: {},
    allIds: [],
    selectedIds: [],
  },
  uploadedFileIds: [],
  loadingAnnotations: false,
  exploreModal: {
    filter: {},
    query: '',
    focusedFileId: null,
  },
  percentageScanned: 0,
};

export const setSelectedAllExplorerFiles = createAction<{
  selectStatus: boolean;
  filter?: SelectFilter;
}>('setSelectedAllExplorerFiles');

function withPayloadType() {
  return (files: FileInfo[]) => ({
    payload: files.map((file) => createFileState(file) as ExplorerFileState),
  });
}
export const setExplorerFiles = createAction(
  'setExplorerFiles',
  withPayloadType()
);

/* eslint-disable no-param-reassign */
const explorerSlice = createGenericTabularDataSlice({
  name: 'explorerSlice',
  initialState: initialState as State,
  reducers: {
    setExplorerFileSelectState: (
      state,
      action: PayloadAction<{ fileId: number; selected: boolean }>
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
    setExplorerSelectedFiles: (state, action: PayloadAction<number[]>) => {
      state.files.selectedIds = action.payload;
    },
    setExplorerModalFocusedFileId(state, action: PayloadAction<number | null>) {
      state.exploreModal.focusedFileId = action.payload;
    },
    setExplorerQueryString(state, action: PayloadAction<string>) {
      if (state.query !== action.payload) resetSortPagination(state);
      state.query = action.payload;
    },
    setExplorerModalQueryString(state, action: PayloadAction<string>) {
      if (state.exploreModal.query !== action.payload) {
        resetSortPagination(state);
      }
      state.exploreModal.query = action.payload;
    },
    setExplorerFilter(state, action: PayloadAction<VisionFileFilterProps>) {
      if (!isEqual(state.filter, action.payload)) resetSortPagination(state);
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
    setLoadingAnnotations(state) {
      state.loadingAnnotations = true;
    },
    addExplorerUploadedFileId(state, action: PayloadAction<number>) {
      state.uploadedFileIds.push(action.payload);
    },
    resetExplorerTemporaryState(state) {
      state.uploadedFileIds = [];
      state.showFileUploadModal = false;
      state.loadingAnnotations = false;
      resetFileState(state);
    },
    setPercentageScanned(state, action: PayloadAction<number>) {
      state.percentageScanned = action.payload;
    },
    setDefaultTimestampKey(state, action: PayloadAction<string>) {
      state.sortMeta.defaultTimestampKey = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setExplorerFiles, (state, { payload }) => {
      resetFileState(state);

      payload.forEach((file) => {
        updateFileState(state, file);
      });
    });

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

    // should remove focused id when deleting a file - need to keep it when returning from review page
    builder.addCase(DeleteFilesById.fulfilled, (state: State, { payload }) => {
      const isDeletedFocusedFile = !!payload.find(
        (fileId) => fileId === state.focusedFileId
      );
      if (isDeletedFocusedFile) {
        state.focusedFileId = null;
      }
    });

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
  setExplorerFileSelectState,
  setExplorerSelectedFiles,
  setFocusedFileId,
  setExplorerModalFocusedFileId,
  hideFileMetadata,
  showFileMetadata,
  setExplorerQueryString,
  setExplorerModalQueryString,
  setExplorerFilter,
  toggleExplorerFilterView,
  setExplorerFileUploadModalVisibility,
  setSortKey,
  setReverse,
  setCurrentPage,
  setPageSize,
  setCurrentView,
  setMapTableTabKey,
  setLoadingAnnotations,
  addExplorerUploadedFileId,
  resetExplorerTemporaryState,
  setIsLoading,
  setPercentageScanned,
  setDefaultTimestampKey,
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
      SortKeys.indexInSortedArray,
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

const updateFileState = (state: State, file: VisionFile) => {
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
  fileState: VisionFile
): ExplorerFileState => {
  return { ...fileState };
};

const resetSortPagination = (state: State) => {
  // Workaround: rest sortKey, since annotations need to be refetched
  state.sortMeta.sortKey = '';
  state.sortMeta.currentPage = 1;
};

/* eslint-enable no-param-reassign */

// hooks

export const useIsSelectedInExplorer = (id: number) => {
  const selectedIds = useSelector(({ explorerReducer }: RootState) =>
    selectExplorerSelectedIds(explorerReducer)
  );
  return selectedIds.includes(id);
};

export const useExplorerFilesSelected = () => {
  const selectedIds = useSelector(({ explorerReducer }: RootState) =>
    selectExplorerSelectedIds(explorerReducer)
  );
  return !!selectedIds.length;
};
