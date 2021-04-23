import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Asset, FileInfo, Label, Metadata } from '@cognite/cdf-sdk-singleton';
import { ToastUtils } from 'src/utils/ToastUtils';
import { ReactText } from 'react';
import { createFileInfo, createFileState } from 'src/store/util/StateUtils';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { SaveAvailableAnnotations } from 'src/store/thunks/SaveAvailableAnnotations';

export type FileState = {
  id: ReactText;
  createdTime: number;
  lastUpdatedTime: number;
  mimeType?: string;
  name: string;
  source?: string;
  uploaded: boolean;
  uploadedTime?: number;
  labels?: Label[];
  metadata?: Metadata;
  linkedAnnotations: string[];
  assetIds?: number[];
};

export type State = {
  dataSetIds?: number[];
  extractExif?: boolean;
  allFilesStatus?: boolean;
  files: {
    byId: Record<ReactText, FileState>;
    allIds: ReactText[];
  };
};

export type VisionAsset = Omit<
  Omit<Asset, 'createdTime'>,
  'lastUpdatedTime'
> & { createdTime: number; lastUpdatedTime: number };

const initialState: State = {
  dataSetIds: undefined,
  extractExif: true,
  allFilesStatus: false,
  // eslint-disable-next-line global-require
  // files: require('./fakeFiles.json'),

  files: {
    byId: {},
    allIds: [],
  },
};

const uploadedFilesSlice = createSlice({
  name: 'uploadedFiles',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    setUploadedFiles: {
      prepare: (files: FileInfo[]) => {
        return { payload: files.map((file) => createFileState(file)) };
      },
      reducer: (state, action: PayloadAction<FileState[]>) => {
        const files = action.payload;

        // clear file state
        state.files.byId = {};
        state.files.allIds = [];

        files.forEach((file) => {
          updateFileState(state, file);
        });
      },
    },
    addUploadedFile: {
      prepare: (file: FileInfo) => {
        return { payload: createFileState(file) };
      },
      reducer: (state, action: PayloadAction<FileState>) => {
        updateFileState(state, action.payload);
      },
    },
    setAllFilesStatus(state, action: PayloadAction<boolean>) {
      state.allFilesStatus = action.payload;
    },
    setDataSetIds(state, action: PayloadAction<number[] | undefined>) {
      state.dataSetIds = action.payload;
    },
    setExtractExif(state, action: PayloadAction<boolean>) {
      state.extractExif = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteFilesById.fulfilled, (state, { payload }) => {
      payload.forEach((fileId) => {
        deleteFileById(state, fileId.id);
      });
    });

    builder.addCase(UpdateFiles.fulfilled, (state, { payload }) => {
      payload.forEach((fileState) => {
        updateFileState(state, fileState);
      });

      if (payload.length) {
        ToastUtils.onSuccess('File updated successfully!');
      }
    });

    builder.addCase(UpdateFiles.rejected, (_, { error }) => {
      if (error && error.message) {
        ToastUtils.onFailure(error?.message);
      }
    });

    builder.addCase(SaveAvailableAnnotations.fulfilled, (state) => {
      state.dataSetIds = initialState.dataSetIds;
      state.extractExif = initialState.extractExif;
      state.files = initialState.files;
    });
  },
});

export const {
  setUploadedFiles,
  addUploadedFile,
  setDataSetIds,
  setExtractExif,
  setAllFilesStatus,
} = uploadedFilesSlice.actions;

export default uploadedFilesSlice.reducer;

export const selectAllFiles = createSelector(
  (state: State) => state.files.allIds,
  (state) => state.files.byId,
  (allIds, allFiles) => {
    return allIds.map((id) => createFileInfo(allFiles[id]));
  }
);

export const selectFileById = createSelector(
  (_: State, fileId: string) => fileId,
  (state) => state.files.byId,
  (fileId, files) => {
    const file = files[fileId];
    return file ? createFileInfo(file) : null;
  }
);

const deleteFileById = (state: State, id: ReactText) => {
  delete state.files.byId[id];
  state.files.allIds = Object.keys(state.files.byId);
};

const updateFileState = (state: State, file: FileState) => {
  const hasInState = !!state.files.byId[file.id];
  state.files.byId[file.id] = file;
  if (!hasInState) {
    state.files.allIds.push(file.id);
  }
};
