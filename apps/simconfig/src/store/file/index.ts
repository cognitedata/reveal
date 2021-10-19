import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FileInfo } from 'components/forms/ModelForm/types';

import { partialUpdate } from '../utils';

import { initialState } from './constants';

export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setSelectedFile: (state, action: PayloadAction<FileInfo>) =>
      partialUpdate(state, {
        selectedFile: action.payload,
      }),
  },
});
export const { setSelectedFile } = fileSlice.actions;
export const fileReducer = fileSlice.reducer;
