import { Label, Metadata } from '@cognite/cdf-sdk-singleton';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type BulkEditTempState = {
  metadata?: Metadata;
  keepOriginalMetadata?: Boolean;
  labels?: Label[];
};

export type State = {
  showFileDownloadModal: boolean;
  showBulkEditModal: boolean;
  bulkEditTemp: BulkEditTempState;
};

const initialState: State = {
  showFileDownloadModal: false,
  showBulkEditModal: false,
  bulkEditTemp: {},
};

const commonSlice = createSlice({
  name: 'commonSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    setFileDownloadModalVisibility(state, action: PayloadAction<boolean>) {
      state.showFileDownloadModal = action.payload;
    },
    setBulkEditModalVisibility(state, action: PayloadAction<boolean>) {
      state.showBulkEditModal = action.payload;
    },
    setBulkEditTemp(state, action: PayloadAction<BulkEditTempState>) {
      state.bulkEditTemp = action.payload;
    },
  },
});

export const {
  setFileDownloadModalVisibility,
  setBulkEditModalVisibility,
  setBulkEditTemp,
} = commonSlice.actions;

export default commonSlice.reducer;
