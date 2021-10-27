import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RequestStatus } from 'store/types';
import { partialUpdate } from 'store/utils';

import { initialState } from './constants';
import { fetchCalculationFile, fetchDownloadLinks, fetchFiles } from './thunks';
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
    setSelectedCalculation: (
      state,
      action: PayloadAction<FileInfoSerializable | undefined>
    ) =>
      partialUpdate(state, {
        selectedCalculation: action.payload,
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

    builder.addCase(fetchCalculationFile.fulfilled, (state, action) =>
      partialUpdate(state, {
        selectedCalculationConfig: action.payload,
      })
    );
  },
});
export const { setSelectedFile, setSelectedCalculation } = fileSlice.actions;
export const fileReducer = fileSlice.reducer;
