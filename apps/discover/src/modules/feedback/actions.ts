import { createAction } from '@reduxjs/toolkit';

import {
  CLEAR_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID,
  SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID,
  TOGGLE_DELETED_FEEDBACK,
} from 'modules/feedback/types';

export const setObjectFeedbackModalDocumentId = createAction<string>(
  SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID
);

export const clearObjectFeedbackModalDocumentId = createAction(
  CLEAR_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID
);

export const toggleFeedbackDelete = createAction(TOGGLE_DELETED_FEEDBACK);
