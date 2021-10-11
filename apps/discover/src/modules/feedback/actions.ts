import { ThunkResult } from 'core/types';
import {
  SET_ITEM,
  SET_ROWS_PER_PAGE,
  SORT_ASCENDING_GENERAL,
  SORT_FIELD_GENERAL,
  TOGGLE_DELETED_GENERAL,
  TOGGLE_DELETED_OBJECT,
  SORT_FIELD_OBJECT,
  SORT_ASCENDING_OBJECT,
  SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID,
  FeedbackItem,
} from 'modules/feedback/types';

function setItem(item: FeedbackItem): ThunkResult<void> {
  return (dispatch) => {
    dispatch({ type: SET_ITEM, item });
  };
}

function setRowsPerPage(number: number): ThunkResult<void> {
  return (dispatch) => {
    dispatch({ type: SET_ROWS_PER_PAGE, number });
  };
}

function setGeneralFeedbackSortField(field: string): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SORT_FIELD_GENERAL,
      field,
    });
  };
}

function setGeneralFeedbackSortAscending(
  isAscending: boolean
): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SORT_ASCENDING_GENERAL,
      asc: isAscending,
    });
  };
}

export function toggleGeneralFeedbackDeleted(): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_DELETED_GENERAL,
    });
  };
}

function setObjectFeedbackSortField(field: string): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SORT_FIELD_OBJECT,
      field,
    });
  };
}

function setObjectFeedbackSortAscending(
  isAscending: boolean
): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SORT_ASCENDING_OBJECT,
      asc: isAscending,
    });
  };
}

export function toggleObjectFeedbackDeleted(): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_DELETED_OBJECT,
    });
  };
}

export const setObjectFeedbackModalDocumentId = (
  documentId: string
): ThunkResult<void> => {
  return (dispatch) => {
    dispatch({
      type: SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID,
      documentId,
    });
  };
};

export const clearObjectFeedbackModalDocumentId = (): ThunkResult<void> => {
  return (dispatch) => {
    dispatch({
      type: SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID,
      documentId: undefined,
    });
  };
};

export const feedbackActions = {
  setItem,
  setRowsPerPage,
  // General feedback
  setGeneralFeedbackSortField,
  setGeneralFeedbackSortAscending,
  toggleGeneralFeedbackDeleted,
  // Object feedback
  setObjectFeedbackSortField,
  setObjectFeedbackSortAscending,
  toggleObjectFeedbackDeleted,
};
