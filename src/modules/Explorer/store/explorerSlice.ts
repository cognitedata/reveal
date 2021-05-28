import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ViewMode } from 'src/modules/Common/types';
import { FileFilterProps } from '@cognite/cdf-sdk-singleton';

export type State = {
  selectedFileId: number | null;
  showFileMetadata: boolean;
  query: string;
  currentView: ViewMode;
  filter: FileFilterProps;
  showFilter: boolean;
  showFileUploadModal: boolean;
};

const initialState: State = {
  selectedFileId: null,
  showFileMetadata: false,
  query: '',
  currentView: 'list',
  filter: {},
  showFilter: true,
  showFileUploadModal: false,
};

const explorerSlice = createSlice({
  name: 'explorerSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    setSelectedFileIdExplorer(state, action: PayloadAction<number>) {
      state.selectedFileId = action.payload;
    },
    toggleExplorerFileMetadata(state) {
      state.showFileMetadata = !state.showFileMetadata;
    },
    showExplorerFileMetadata(state) {
      state.showFileMetadata = true;
    },
    setQueryString(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setFilter(state, action: PayloadAction<FileFilterProps>) {
      state.filter = action.payload;
    },
    setCurrentView(state, action: PayloadAction<ViewMode>) {
      state.currentView = action.payload;
    },
    toggleFilterView(state) {
      state.showFilter = !state.showFilter;
    },
    setFileUploadModalVisibility(state, action: PayloadAction<boolean>) {
      state.showFileUploadModal = action.payload;
    },
  },
  // extraReducers: (builder) => {},
});

export const {
  setSelectedFileIdExplorer,
  toggleExplorerFileMetadata,
  showExplorerFileMetadata,
  setQueryString,
  setFilter,
  setCurrentView,
  toggleFilterView,
  setFileUploadModalVisibility,
} = explorerSlice.actions;

export default explorerSlice.reducer;
