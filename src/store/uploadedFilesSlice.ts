import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v3 } from '@cognite/cdf-sdk-singleton';
import fakeFiles from './fakeFiles.json';

type State = {
  uploadedFiles: Array<v3.FileInfo>;
};

const initialState: State = {
  // uploadedFiles: [],
  uploadedFiles: fakeFiles as any, // real has js Date instances, fake has strings, it's fine for now
};

const uploadedFilesSlice = createSlice({
  name: 'uploadedFiles',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    setUploadedFiles(state, action: PayloadAction<State>) {
      const { uploadedFiles } = action.payload;
      state.uploadedFiles = uploadedFiles;
    },
    addUploadedFile(state, action: PayloadAction<v3.FileInfo>) {
      state.uploadedFiles = state.uploadedFiles.concat(action.payload);
    },
  },
  /* eslint-enable no-param-reassign */
});

export const { setUploadedFiles, addUploadedFile } = uploadedFilesSlice.actions;

export default uploadedFilesSlice.reducer;
