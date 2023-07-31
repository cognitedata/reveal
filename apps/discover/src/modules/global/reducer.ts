import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { GlobalState, GlobalSidePanelTypes } from 'modules/global/types';

export const initialState: GlobalState = {
  sidePanel: {
    visible: false,
  },
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    showGlobalSidePanel(state, action: PayloadAction<GlobalSidePanelTypes>) {
      state.sidePanel = {
        visible: true,
        data: action.payload.data,
        type: action.payload.type,
      };
    },
    hideGlobalSidePanel(state) {
      state.sidePanel = {
        visible: false,
      };
    },
  },
});

export const { showGlobalSidePanel, hideGlobalSidePanel } = globalSlice.actions;

export const global = globalSlice.reducer;
