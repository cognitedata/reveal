import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Asset, FileInfo, Label, Metadata } from '@cognite/cdf-sdk-singleton';
import { ToastUtils } from 'src/utils/ToastUtils';
import { ReactText } from 'react';
import { RootState } from 'src/store/rootReducer';
import { createFileInfo, createFileState } from 'src/store/util/StateUtils';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import {
  MetadataItem,
  VisionFileDetails,
} from 'src/components/FileMetadata/Types';
import { updateFileInfoField } from 'src/store/thunks/updateFileInfoField';
import { generateKeyValueArray } from 'src/utils/FormatUtils';
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
};

export type FileInfoValueState = string | Label[] | null;

export type UploadedFilesState = {
  dataSetIds?: number[];
  extractExif?: boolean;
  allFilesStatus?: boolean;
  files: {
    byId: Record<ReactText, FileState>;
    allIds: ReactText[];
  };
  metadataEdit: boolean;
  fileDetails: Record<string, FileInfoValueState>;
  fileMetaData: Record<number, MetadataItem>;
  loadingField: string | null;
};

export type VisionAsset = Omit<
  Omit<Asset, 'createdTime'>,
  'lastUpdatedTime'
> & { createdTime: number; lastUpdatedTime: number };

// For debugging
// const data = require('./fakeFiles.json');

// Object.keys(data).forEach((key) => {
//   data[key].uploadedTime = new Date(data[key].uploadedTime);
//   data[key].createdTime = new Date(data[key].createdTime);
//   data[key].lastUpdatedTime = new Date(data[key].lastUpdatedTime);
// }, data);
const initialState: UploadedFilesState = {
  dataSetIds: undefined,
  extractExif: true,
  allFilesStatus: false,
  // eslint-disable-next-line global-require
  // files: require('./fakeFiles.json'),

  files: {
    byId: {},
    allIds: [],
  },
  metadataEdit: false,
  fileDetails: {},
  fileMetaData: {},
  loadingField: null,
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
    toggleMetaDataTableEditMode(state, action: PayloadAction<MetadataItem[]>) {
      const editMode = state.metadataEdit;

      if (editMode) {
        // filter rows with empty keys and empty values when finishing edit mode
        const metaRowKeys = Object.keys(state.fileMetaData);
        metaRowKeys.forEach((rowKey) => {
          const metaKey = state.fileMetaData[parseInt(rowKey, 10)].key;
          const metaValue = state.fileMetaData[parseInt(rowKey, 10)].value;

          if (!(metaKey && metaValue)) {
            delete state.fileMetaData[parseInt(rowKey, 10)];
          }
        });
      } else {
        // set metadata when starting edit mode
        state.fileMetaData = {};
        action.payload.forEach((item, index) => {
          state.fileMetaData[index] = item;
        });
      }
      state.metadataEdit = !editMode;
    },
    setAllFilesStatus(state, action: PayloadAction<boolean>) {
      state.allFilesStatus = action.payload;
    },
    fileInfoEdit(
      state,
      action: PayloadAction<{
        key: string;
        value: FileInfoValueState;
      }>
    ) {
      state.fileDetails[action.payload.key] = action.payload.value || null;
    },
    fileMetaDataEdit(
      state,
      action: PayloadAction<{
        index: number;
        key: string;
        value: string;
      }>
    ) {
      state.fileMetaData[action.payload.index] = {
        key: action.payload.key,
        value: action.payload.value || '',
      };
    },
    fileMetaDataAddRow(state, action: PayloadAction<MetadataItem[]>) {
      state.metadataEdit = true;
      state.fileMetaData = {};
      const metaLength = Object.keys(action.payload).length;
      action.payload.forEach((item, index) => {
        state.fileMetaData[index] = item;
      });
      state.fileMetaData[metaLength] = { key: '', value: '' };
    },
    resetEditHistory(state) {
      resetEditHistoryState(state);
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

    // On Update File //

    builder.addCase(updateFileInfoField.fulfilled, (state, { meta }) => {
      const field = meta.arg.key;
      if (field === 'metadata') {
        state.fileMetaData = {};
      } else {
        delete state.fileDetails[field];
      }
      state.loadingField = null;
    });

    builder.addCase(updateFileInfoField.pending, (state, { meta }) => {
      const field = meta.arg.key;
      state.loadingField = field;
    });

    builder.addCase(updateFileInfoField.rejected, (state, { meta }) => {
      const field = meta.arg.key;
      delete state.fileDetails[field];
      state.loadingField = null;
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
      state.metadataEdit = initialState.metadataEdit;
      state.fileDetails = initialState.fileDetails;
      state.fileMetaData = initialState.fileMetaData;
      state.loadingField = initialState.loadingField;
    });
  },
});

export const {
  setUploadedFiles,
  addUploadedFile,
  fileInfoEdit,
  fileMetaDataEdit,
  toggleMetaDataTableEditMode,
  fileMetaDataAddRow,
  resetEditHistory,
  setDataSetIds,
  setExtractExif,
  setAllFilesStatus,
} = uploadedFilesSlice.actions;

export default uploadedFilesSlice.reducer;

export const selectAllFiles = createSelector(
  (state: UploadedFilesState) => state.files.allIds,
  (state) => state.files.byId,
  (allIds, allFiles) => {
    return allIds.map((id) => createFileInfo(allFiles[id]));
  }
);

export const selectFileById = createSelector(
  (_: UploadedFilesState, fileId: string) => fileId,
  (state) => state.files.byId,
  (fileId, files) => {
    const file = files[fileId];
    return file ? createFileInfo(file) : null;
  }
);

// metadata selectors //

export const metadataEditMode = (state: UploadedFilesState): boolean =>
  state.metadataEdit;

export const editedFileDetails = (
  state: UploadedFilesState
): Record<string, FileInfoValueState> => state.fileDetails;

export const editedFileMeta = (
  state: UploadedFilesState
): Record<number, MetadataItem> => state.fileMetaData;

export const selectUpdatedFileDetails = createSelector(
  (state: RootState) => editedFileDetails(state.uploadedFiles),
  (state: RootState, id: string) => selectFileById(state.uploadedFiles, id),
  (editedInfo, fileInfo) => {
    if (fileInfo) {
      const mergedInfo: VisionFileDetails = {
        ...fileInfo,
        ...editedInfo,
      };
      return mergedInfo;
    }
    return null;
  }
);

export const selectUpdatedFileMeta = createSelector(
  (state: RootState) => editedFileMeta(state.uploadedFiles),
  (state: RootState, id: string) => selectFileById(state.uploadedFiles, id),
  (editedMeta, fileInfo) => {
    let metadata: MetadataItem[] = generateKeyValueArray(fileInfo?.metadata);

    if (Object.keys(editedMeta).length > 0) {
      metadata = Object.values(editedMeta);
    }
    return metadata;
  }
);

// state helper functions

const resetEditHistoryState = (state: UploadedFilesState) => {
  state.metadataEdit = false;
  state.fileMetaData = {};
  state.fileDetails = {};
};

const deleteFileById = (state: UploadedFilesState, id: ReactText) => {
  delete state.files.byId[id];
  state.files.allIds = Object.keys(state.files.byId);
};

const updateFileState = (state: UploadedFilesState, file: FileState) => {
  const hasInState = !!state.files.byId[file.id];
  state.files.byId[file.id] = file;
  if (!hasInState) {
    state.files.allIds.push(file.id);
  }
};
