import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { v3, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { ThunkConfig } from 'src/store/common';
import { ToastUtils } from 'src/utils/ToastUtils';
import isEqual from 'lodash-es/isEqual';

export const deleteFilesById = createAsyncThunk<
  v3.InternalId[],
  v3.InternalId[],
  ThunkConfig
>('uploadedFiles/deleteFileById', async (fileIds) => {
  if (!fileIds) {
    throw new Error('Ids not provided!');
  }
  await sdk.files.delete(fileIds);
  return fileIds;
});

export const updateFileById = createAsyncThunk<
  v3.FileInfo[],
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
        const newLabels = (editedFileDetails[key] as v3.Label[]) || [];
        const existingLabels = (fileDetails && fileDetails.labels) || [];
        const addedLabels: v3.Label[] = [];
        const removedLabels: v3.Label[] = [];
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
        const metadata: v3.Metadata = {};

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
          isEqual(value, fileDetails[key as keyof v3.FileInfo])
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

    builder.addCase(updateFileById.rejected, (state, { error }) => {
      if (error && error.message) {
        ToastUtils.onFailure(error?.message);
      }
    });
  },
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
