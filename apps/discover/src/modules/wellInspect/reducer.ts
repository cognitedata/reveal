/* eslint-disable no-param-reassign */
import { createReducer } from '@reduxjs/toolkit';

import { SelectedBarData } from 'components/charts/modules/StackedBarChart/types';
import { NPTEvent } from 'modules/wellSearch/types';
import { SIDEBAR_SIZE } from 'pages/authorized/search/well/inspect/Sidebar/constants';

import {
  setInspectSidebarWidth,
  setColoredWellbores,
  setSelectedRelatedDocumentColumnsAction,
  setNPTGraphSelectedWellboreData,
  clearNPTGraphSelectedWellboreData,
} from './actions';
import { WellInspectAction, WellInspectState } from './types';

export const initialState: WellInspectState = {
  inspectSidebarWidth: SIDEBAR_SIZE.min,
  coloredWellbores: false,
  selectedRelatedDocumentsColumns: {},
  nptGraphSelectedWellboreData: {} as SelectedBarData<NPTEvent>,
};

const wellInspectReducerCreator = createReducer(initialState, (builder) => {
  builder
    .addCase(setInspectSidebarWidth, (state, action) => {
      state.inspectSidebarWidth = action.payload;
    })
    .addCase(setColoredWellbores, (state, action) => {
      state.coloredWellbores = action.payload;
    })
    .addCase(setSelectedRelatedDocumentColumnsAction, (state, action) => {
      state.selectedRelatedDocumentsColumns = {
        ...state.selectedRelatedDocumentsColumns,
        ...action.payload,
      };
    })
    .addCase(setNPTGraphSelectedWellboreData, (state, action) => {
      state.nptGraphSelectedWellboreData = {
        ...state.nptGraphSelectedWellboreData,
        ...action.payload,
      };
    })
    .addCase(clearNPTGraphSelectedWellboreData, (state) => {
      state.nptGraphSelectedWellboreData = {} as SelectedBarData<NPTEvent>;
    });
});

export const wellInspect = (
  state: WellInspectState | undefined,
  action: WellInspectAction
): WellInspectState => {
  return wellInspectReducerCreator(state, action);
};

export default wellInspect;
