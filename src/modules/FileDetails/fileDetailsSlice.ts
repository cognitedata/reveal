import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Label } from '@cognite/sdk';
import { selectFileById } from 'src/modules/Common/store/files/selectors';
import { RootState } from 'src/store/rootReducer';
import {
  MetadataItem,
  VisionFileDetails,
} from 'src/modules/FileDetails/Components/FileMetadata/Types';
import { updateFileInfoField } from 'src/store/thunks/Files/updateFileInfoField';
import { generateKeyValueArray } from 'src/utils/FormatUtils';

export type FileInfoValueState = string | Label[] | number[] | null;

export type State = {
  metadataEdit: boolean;
  fileDetails: Record<string, FileInfoValueState>;
  fileMetaData: Record<number, MetadataItem>;
  loadingField: string | null;
};

export const initialState: State = {
  metadataEdit: false,
  fileDetails: {},
  fileMetaData: {},
  loadingField: null,
};

const fileDetailsSlice = createSlice({
  name: 'fileDetailsSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
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
  },
  extraReducers: (builder) => {
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
  },
});

export const {
  fileInfoEdit,
  fileMetaDataEdit,
  toggleMetaDataTableEditMode,
  fileMetaDataAddRow,
  resetEditHistory,
} = fileDetailsSlice.actions;

export default fileDetailsSlice.reducer;

export const metadataEditMode = (state: State): boolean => state.metadataEdit;

export const editedFileDetails = (
  state: State
): Record<string, FileInfoValueState> => state.fileDetails;

export const editedFileMeta = (state: State): Record<number, MetadataItem> =>
  state.fileMetaData;

export const selectUpdatedFileDetails = createSelector(
  (state: RootState) => editedFileDetails(state.fileDetailsSlice),
  (state: RootState, id: number) => selectFileById(state.fileReducer, id),
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
  (state: RootState) => editedFileMeta(state.fileDetailsSlice),
  (state: RootState, id: number) => selectFileById(state.fileReducer, id),
  (editedMeta, fileInfo) => {
    let metadata: MetadataItem[] = generateKeyValueArray(fileInfo?.metadata);

    if (Object.keys(editedMeta).length > 0) {
      metadata = Object.values(editedMeta);
    }
    return metadata;
  }
);

// state helper functions

const resetEditHistoryState = (state: State) => {
  state.metadataEdit = false;
  state.fileMetaData = {};
  state.fileDetails = {};
};
