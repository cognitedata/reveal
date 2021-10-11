/* eslint-disable no-param-reassign */
import { createReducer } from '@reduxjs/toolkit';

import { SIDEBAR_SIZE } from 'pages/authorized/search/well/inspect/Sidebar/constants';

import {
  setInspectSidebarWidth,
  setSelectedRelatedDocumentColumnsAction,
} from './actions';
import { WellInspectAction, WellInspectState } from './types';

export const initialState: WellInspectState = {
  inspectSidebarWidth: SIDEBAR_SIZE.min,
  selectedRelatedDocumentsColumns: {},
};

const wellInspectReducerCreator = createReducer(initialState, (builder) => {
  builder
    .addCase(setInspectSidebarWidth, (state, action) => {
      state.inspectSidebarWidth = action.payload;
    })
    .addCase(setSelectedRelatedDocumentColumnsAction, (state, action) => {
      state.selectedRelatedDocumentsColumns = {
        ...state.selectedRelatedDocumentsColumns,
        ...action.payload,
      };
    });
});

export const wellInspect = (
  state: WellInspectState | undefined,
  action: WellInspectAction
): WellInspectState => {
  return wellInspectReducerCreator(state, action);
};

export default wellInspect;
