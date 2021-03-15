import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { InternalId, v3, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { RootState } from 'src/store/rootReducer';

type State = {
  uploadedFiles: Array<v3.FileInfo>;
};

const initialState: State = {
  uploadedFiles: [],
  // eslint-disable-next-line global-require
  // uploadedFiles: require('./fakeFiles.json'), // real has js Date instances, fake has strings, it's fine for now
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

export const uploadedFiles = (state: State): Array<v3.FileInfo> =>
  state.uploadedFiles;

export const selectFileById = createSelector(
  (_: State, fileId: string) => fileId,
  uploadedFiles,
  (fileId, files) => {
    return files.find((f) => f.id === parseInt(fileId, 10))!;
  }
);

type ThunkConfig = { state: RootState };

export const fetchFilesById = createAsyncThunk<void, InternalId[], ThunkConfig>(
  'uploadedFiles/fetchFiles',
  async (fileIds, { dispatch }) => {
    if (!fileIds.length) {
      throw new Error('Provide at least one fileId');
    }
    const files = await sdk.files.retrieve(fileIds);
    dispatch(setUploadedFiles({ uploadedFiles: files }));
  }
);
