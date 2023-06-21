import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MetadataItem } from 'src/modules/FileDetails/Components/FileMetadata/Types';
import { updateFileInfoField } from 'src/store/thunks/Files/updateFileInfoField';
import {
  FileDetailsState,
  FileInfoValueState,
} from 'src/modules/FileDetails/types';
import { resetEditHistoryState } from 'src/modules/FileDetails/utils';

export const initialState: FileDetailsState = {
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
          const { metaKey } = state.fileMetaData[parseInt(rowKey, 10)];
          const { metaValue } = state.fileMetaData[parseInt(rowKey, 10)];

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
        value?: FileInfoValueState;
      }>
    ) {
      state.fileDetails[action.payload.key] = action.payload.value || null;
    },
    fileMetaDataEdit(
      state,
      action: PayloadAction<{
        rowIndex: number;
        metaKey: string;
        metaValue?: string;
      }>
    ) {
      state.fileMetaData[action.payload.rowIndex] = {
        metaKey: action.payload.metaKey,
        metaValue: action.payload.metaValue || '',
      };
    },
    fileMetaDataAddRow(state, action: PayloadAction<MetadataItem[]>) {
      state.metadataEdit = true;
      state.fileMetaData = {};
      const metaLength = Object.keys(action.payload).length;
      action.payload.forEach((item, index) => {
        state.fileMetaData[index] = item;
      });
      state.fileMetaData[metaLength] = { metaKey: '', metaValue: '' };
    },
    resetEditHistory(state) {
      resetEditHistoryState(state);
    },
    cancelFileDetailsEdit(state) {
      state.fileDetails = initialState.fileDetails;
      state.fileMetaData = initialState.fileMetaData;
      state.loadingField = initialState.loadingField;
      state.metadataEdit = initialState.metadataEdit;
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
  cancelFileDetailsEdit,
} = fileDetailsSlice.actions;

export default fileDetailsSlice.reducer;
