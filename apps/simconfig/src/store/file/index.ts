import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RequestStatus } from '../types';
import { partialUpdate } from '../utils';

import { initialState } from './constants';
import { fetchDownloadLinks, fetchFiles } from './thunks';
import { FileInfoSerializable } from './types';

export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setSelectedFile: (
      state,
      action: PayloadAction<FileInfoSerializable | undefined>
    ) =>
      partialUpdate(state, {
        selectedFile: action.payload,
      }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.LOADING,
        })
      )
      .addCase(fetchFiles.fulfilled, (state, action) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.SUCCESS,
          initialized: true,
          files: action.payload,
        })
      )
      .addCase(fetchFiles.rejected, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.ERROR,
        })
      );

    builder
      .addCase(fetchDownloadLinks.pending, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.LOADING,
        })
      )
      .addCase(fetchDownloadLinks.fulfilled, (state, action) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.SUCCESS,
          initialized: true,
          downloadLinks: action.payload,
        })
      )
      .addCase(fetchDownloadLinks.rejected, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.ERROR,
        })
      );
  },
});
export const { setSelectedFile } = fileSlice.actions;
export const fileReducer = fileSlice.reducer;
