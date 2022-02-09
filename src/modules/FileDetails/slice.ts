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
