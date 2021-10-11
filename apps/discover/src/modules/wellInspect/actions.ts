import { createAction } from '@reduxjs/toolkit';
import { ThunkResult } from 'core';

import { storage } from '@cognite/react-container';

import {
  SET_INSPECT_SIDEBAR_WIDTH,
  SET_SELECTED_RELATED_DOCUMENT_COLUMNS,
  BooleanSelection,
} from './types';
import { getInitialSelectedRelatedDocumentsColumns } from './utils';

export const WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS =
  'WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS';

export const setInspectSidebarWidth = createAction<number>(
  SET_INSPECT_SIDEBAR_WIDTH
);

export const setSelectedRelatedDocumentColumnsAction =
  createAction<BooleanSelection>(SET_SELECTED_RELATED_DOCUMENT_COLUMNS);

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
