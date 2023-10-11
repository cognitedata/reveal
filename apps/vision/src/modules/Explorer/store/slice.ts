import { createAction, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import isEqual from 'lodash/isEqual';

import { FileInfo } from '@cognite/sdk';

import { DEFAULT_PAGE_SIZE } from '../../../constants/PaginationConsts';
import { clearExplorerFileState } from '../../../store/commonActions';
import { makeReducerSelectAllFilesWithFilter } from '../../../store/commonReducers';
import { createGenericTabularDataSlice } from '../../../store/genericTabularDataSlice';
import { RetrieveAnnotations } from '../../../store/thunks/Annotation/RetrieveAnnotations';
import { DeleteFilesById } from '../../../store/thunks/Files/DeleteFilesById';
import { UpdateFiles } from '../../../store/thunks/Files/UpdateFiles';
import { createFileState } from '../../../store/util/StateUtils';
import { PageSize } from '../../Common/Components/FileTable/types';
import { SelectFilter } from '../../Common/types';
import { SortKeys } from '../../Common/Utils/SortUtils';
import { VisionFileFilterProps } from '../../FilterSidePanel/types';
import { ExplorerFileState, ExplorerState } from '../types';

import {
  deleteFileById,
  updateFileState,
  resetFileState,
  resetSortPagination,
} from './utils';

const initialState: ExplorerState = {
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
    sortMeta: {
      sortKey: '',
      reverse: false,
      currentPage: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      defaultTimestampKey: SortKeys.createdTime,
    },
  },
  percentageScanned: 0,
};

export const setSelectedAllExplorerFiles = createAction<{
  selectStatus: boolean;
  filter?: SelectFilter;
  fileIds?: number[];
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
const explorerReducer = createGenericTabularDataSlice({
  name: 'explorerReducer',
  initialState: initialState as ExplorerState,
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

    setExploreModalSortKey(state, action: PayloadAction<string>) {
      state.exploreModal.sortMeta.sortKey = action.payload;
    },
    setExploreModalReverse(state, action: PayloadAction<boolean>) {
      state.exploreModal.sortMeta.reverse = action.payload;
    },
    setExploreModalCurrentPage(state, action: PayloadAction<number>) {
      state.exploreModal.sortMeta.currentPage = action.payload;
    },
    setExploreModalPageSize(state, action: PayloadAction<PageSize>) {
      state.exploreModal.sortMeta.pageSize = action.payload;
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
    clearExplorerUploadedFileIds(state) {
      state.uploadedFileIds = [];
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
      (state: ExplorerState, { payload: _ }) => {
        state.loadingAnnotations = false;
      }
    );

    // should remove focused id when deleting a file - need to keep it when returning from review page
    builder.addCase(
      DeleteFilesById.fulfilled,
      (state: ExplorerState, { payload }) => {
        const isDeletedFocusedFile = !!payload.find(
          (fileId) => fileId === state.focusedFileId
        );
        if (isDeletedFocusedFile) {
          state.focusedFileId = null;
        }
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
  setExploreModalSortKey,
  setExploreModalReverse,
  setExploreModalCurrentPage,
  setExploreModalPageSize,
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
  clearExplorerUploadedFileIds,
  resetExplorerTemporaryState,
  setIsLoading,
  setPercentageScanned,
  setDefaultTimestampKey,
} = explorerReducer.actions;

export default explorerReducer.reducer;
