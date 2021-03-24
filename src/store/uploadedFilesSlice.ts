import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  FileInfo,
  IdEither,
  InternalId,
  Label,
  Metadata,
  v3Client as sdk,
} from '@cognite/cdf-sdk-singleton';
import { ThunkConfig } from 'src/store/common';
import { ToastUtils } from 'src/utils/ToastUtils';
import isEqual from 'lodash-es/isEqual';

export const deleteFilesById = createAsyncThunk<
  InternalId[],
  InternalId[],
  ThunkConfig
>('uploadedFiles/deleteFileById', async (fileIds) => {
  if (!fileIds) {
    throw new Error('Ids not provided!');
  }
  await sdk.files.delete(fileIds);
  return fileIds;
});

export const updateFileById = createAsyncThunk<
  FileInfo[],
  { fileId: number; key: string },
  ThunkConfig
>('uploadedFiles/updateFileById', async ({ fileId, key }, { getState }) => {
  if (!fileId) {
    throw new Error('Id not provided!');
  }

  const fileDetails = getState().uploadedFiles.uploadedFiles.find(
    (file) => file.id === fileId
  );

  if (!fileDetails) {
    return [];
  }
  const editedFileDetails = getState().previewSlice.fileDetails;

  if (key) {
    let updateInfoSet = {};

    switch (key) {
      case 'labels': {
        if (!Object.keys(editedFileDetails).includes(key)) {
          return [];
        }
        const newLabels = (editedFileDetails[key] as Label[]) || [];
        const existingLabels: Label[] =
          (fileDetails && fileDetails.labels) || [];
        const addedLabels: Label[] = [];
        const removedLabels: Label[] = [];
        existingLabels.forEach((existingLbl) => {
          const found = newLabels.find(
            (newLabel) => existingLbl.externalId === newLabel.externalId
          );
          if (!found) {
            removedLabels.push(existingLbl);
          }
        });
        newLabels.forEach((newLbl) => {
          const found = existingLabels.find(
            (existingLbl) => existingLbl.externalId === newLbl.externalId
          );
          if (!found) {
            addedLabels.push(newLbl);
          }
        });
        updateInfoSet = {
          [key]: { add: addedLabels, remove: removedLabels },
        };
        break;
      }
      case 'metadata': {
        const metadata: Metadata = {};

        const editedFileMeta = getState().previewSlice.fileMetaData;
        const metaKeys = Object.keys(editedFileMeta);

        metaKeys.forEach((rowId) => {
          const row = editedFileMeta[parseInt(rowId, 10)];
          metadata[row.key] = row.value.toString();
        });

        if (isEqual(metadata, fileDetails?.metadata)) {
          return [];
        }

        updateInfoSet = {
          [key]: { set: metadata },
        };
        break;
      }
      default: {
        const value = editedFileDetails[key];
        if (
          !Object.keys(editedFileDetails).includes(key) ||
          isEqual(value, fileDetails[key as keyof FileInfo])
        ) {
          return [];
        }
        if (value === undefined || value === '' || value === null) {
          updateInfoSet = { [key]: { setNull: true } };
        } else {
          updateInfoSet = { [key]: { set: value } };
        }
      }
    }

    const payload = [{ id: fileId, update: updateInfoSet }];
    const fileInfo = await sdk.files.update(payload);
    return fileInfo;
  }
  throw new Error('Update Data is Empty!');
});

type State = {
  uploadedFiles: Array<FileInfo>;
  dataSetIds?: IdEither[];
  extractExif?: boolean;
};

// For debugging
// const data = require('./fakeFiles.json');

// Object.keys(data).forEach((key) => {
//   data[key].uploadedTime = new Date(data[key].uploadedTime);
//   data[key].createdTime = new Date(data[key].createdTime);
//   data[key].lastUpdatedTime = new Date(data[key].lastUpdatedTime);
// }, data);
const initialState: State = {
  uploadedFiles: [],
  dataSetIds: undefined,
  extractExif: false,
  // eslint-disable-next-line global-require
  // uploadedFiles: data,
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
    addUploadedFile(state, action: PayloadAction<FileInfo>) {
      state.uploadedFiles = state.uploadedFiles.concat(action.payload);
    },
    setDataSetIds(state, action: PayloadAction<IdEither[] | undefined>) {
      state.dataSetIds = action.payload;
    },
    setExtractExif(state, action: PayloadAction<boolean>) {
      state.extractExif = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteFilesById.fulfilled, (state, { payload }) => {
      payload.forEach((fileId) => {
        const fileIndex = state.uploadedFiles.findIndex(
          (file) => file.id === fileId.id
        );
        if (fileIndex >= 0) {
          state.uploadedFiles.splice(fileIndex, 1);
        }
      });
    });

    builder.addCase(updateFileById.fulfilled, (state, { payload }) => {
      payload.forEach((fileInfo) => {
        const fileIndex = state.uploadedFiles.findIndex(
          (file) => file.id === fileInfo.id
        );
        if (fileIndex >= 0) {
          state.uploadedFiles[fileIndex] = fileInfo;
        }
      });

      if (payload.length) {
        ToastUtils.onSuccess('File updated successfully!');
      }
    });

    builder.addCase(updateFileById.rejected, (_, { error }) => {
      if (error && error.message) {
        ToastUtils.onFailure(error?.message);
      }
    });
  },
});

export const {
  setUploadedFiles,
  addUploadedFile,
  setDataSetIds,
  setExtractExif,
} = uploadedFilesSlice.actions;

export default uploadedFilesSlice.reducer;

export const uploadedFiles = (state: State): Array<FileInfo> =>
  state.uploadedFiles;

export const selectFileById = createSelector(
  (_: State, fileId: string) => fileId,
  uploadedFiles,
  (fileId, files) => {
    return files.find((f) => f.id === parseInt(fileId, 10))!;
  }
);
