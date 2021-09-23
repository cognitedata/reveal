import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_MODEL_SOURCE, DEFAULT_UNIT_SYSTEM } from './constants';
import { FileInfo, ModelMetadata, UpdateFieldPayload } from './types';

export const initialFileInfoState: FileInfo = {
  name: '',
  mimeType: 'application/octet-stream',
  source: DEFAULT_MODEL_SOURCE,
  metadata: {
    dataType: '',
    description: '',
    fileName: '',
    nextVersion: '',
    previousVersion: '',
    unitSystem: DEFAULT_UNIT_SYSTEM,
    userEmail: '',
    version: '1',
  },
};

export const fileInfoSlice = createSlice({
  name: 'fileInfo',
  initialState: initialFileInfoState,
  reducers: {
    reset: () => initialFileInfoState,
    updateMetadata: (
      state,
      {
        payload: { name, value },
      }: PayloadAction<UpdateFieldPayload<ModelMetadata>>
    ) => ({
      ...state,
      metadata: {
        ...state.metadata,
        [name]: value,
      },
    }),
    updateFileInfo: (
      state,
      { payload: { name, value } }: PayloadAction<UpdateFieldPayload<FileInfo>>
    ) => ({ ...state, [name]: value }),
  },
});

export default fileInfoSlice.reducer;
