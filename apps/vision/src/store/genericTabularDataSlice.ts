import {
  ActionReducerMapBuilder,
  createSlice,
  PayloadAction,
  SliceCaseReducers,
  ValidateSliceCaseReducers,
} from '@reduxjs/toolkit';
import { PageSize } from 'src/modules/Common/Components/FileTable/types';
import { ViewMode } from 'src/modules/Common/types';

export interface GenericTabularState {
  focusedFileId: number | null;
  showFileMetadata: boolean;
  currentView: ViewMode;
  mapTableTabKey: string;
  sortMeta: {
    sortKey?: string;
    reverse?: boolean;
    // this default key will override by the last selected choice for the Timestamp column
    defaultTimestampKey?: string;
    currentPage: number;
    pageSize: PageSize;
  };
  isLoading: boolean;
}

/* eslint-disable no-param-reassign */
export const createGenericTabularDataSlice = <
  T extends GenericTabularState,
  Reducers extends SliceCaseReducers<T>
>({
  name = '',
  initialState,
  reducers,
  extraReducers,
}: {
  name: string;
  initialState: T;
  reducers: ValidateSliceCaseReducers<T, Reducers>;
  extraReducers: (builder: ActionReducerMapBuilder<T>) => void;
}) => {
  return createSlice({
    name,
    initialState,
    reducers: {
      setFocusedFileId(state, action: PayloadAction<number | null>) {
        state.focusedFileId = action.payload;
      },
      hideFileMetadata(state) {
        state.showFileMetadata = false;
      },
      showFileMetadata(state) {
        state.showFileMetadata = true;
      },
      setCurrentView(state, action: PayloadAction<ViewMode>) {
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
      setSortKey(state, action: PayloadAction<string>) {
        state.sortMeta.sortKey = action.payload;
      },
      setReverse(state, action: PayloadAction<boolean>) {
        state.sortMeta.reverse = action.payload;
      },
      setCurrentPage(state, action: PayloadAction<number>) {
        state.sortMeta.currentPage = action.payload;
      },
      setPageSize(state, action: PayloadAction<PageSize>) {
        state.sortMeta.pageSize = action.payload;
      },
      setIsLoading(state, action: PayloadAction<boolean>) {
        state.isLoading = action.payload;
      },
      ...reducers,
    },
    extraReducers,
  });
};
