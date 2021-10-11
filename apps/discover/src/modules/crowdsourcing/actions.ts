import { ThunkResult } from 'core/types';

import {
  SORT_FIELD_DOCUMENT,
  SORT_ASCENDING_DOCUMENT,
  TOGGLE_SUBMITTEDBYME_DOCUMENT,
  RESET_DOCUMENT_TYPE_FIELDS,
  CLEAR_SEARCH_DOCUMENT_FEEDBACK,
} from './types';

export function setDocumentSortField(field: string): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SORT_FIELD_DOCUMENT,
      field,
    });
  };
}

export function setDocumentSortAscending(asc: boolean): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SORT_ASCENDING_DOCUMENT,
      asc,
    });
  };
}

export function toggleDocumentSubmittedByMe(): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_SUBMITTEDBYME_DOCUMENT,
    });
  };
}

export function resetDocumentTypeFields(): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: RESET_DOCUMENT_TYPE_FIELDS,
    });
  };
}

export function clearSearchDocumentType(): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: CLEAR_SEARCH_DOCUMENT_FEEDBACK,
    });
  };
}
