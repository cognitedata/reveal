import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from 'core';

import { storage } from '@cognite/react-container';

import { SelectedBarData } from 'components/charts/modules/StackedBarChart/types';
import { NPTEvent } from 'modules/wellSearch/types';

import {
  SET_INSPECT_SIDEBAR_WIDTH,
  SET_SELECTED_RELATED_DOCUMENT_COLUMNS,
  SET_NPT_GRAPH_SELECTED_WELLBORE_DATA,
  BooleanSelection,
  CLEAR_NPT_GRAPH_SELECTED_WELLBORE_DATA,
  SET_COLORED_WELLBORES,
} from './types';
import { getInitialSelectedRelatedDocumentsColumns } from './utils';

export const WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS =
  'WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS';

export const setInspectSidebarWidth = createAction<number>(
  SET_INSPECT_SIDEBAR_WIDTH
);

export const setColoredWellbores = createAction<boolean>(SET_COLORED_WELLBORES);

export const setSelectedRelatedDocumentColumnsAction =
  createAction<BooleanSelection>(SET_SELECTED_RELATED_DOCUMENT_COLUMNS);

export const setNPTGraphSelectedWellboreData = createAction<
  Partial<SelectedBarData<NPTEvent>>
>(SET_NPT_GRAPH_SELECTED_WELLBORE_DATA);

export const clearNPTGraphSelectedWellboreData = createAction(
  CLEAR_NPT_GRAPH_SELECTED_WELLBORE_DATA
);

export const initializeWellInspect = (): ThunkResult<void> => {
  return (dispatch) => {
    dispatch(
      setSelectedRelatedDocumentColumns(
        getInitialSelectedRelatedDocumentsColumns()
      )
    );
  };
};

export const setSelectedRelatedDocumentColumns = (
  payload: BooleanSelection
): ThunkResult<void> => {
  return (dispatch, getState) => {
    dispatch({ type: SET_SELECTED_RELATED_DOCUMENT_COLUMNS, payload });
    const state = getState().wellInspect;
    storage.setItem(
      WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS,
      state.selectedRelatedDocumentsColumns
    );
  };
};
