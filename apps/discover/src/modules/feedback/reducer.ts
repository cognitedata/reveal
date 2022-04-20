import { createReducer } from '@reduxjs/toolkit';

import {
  clearObjectFeedbackModalDocumentId,
  setObjectFeedbackModalDocumentId,
  toggleFeedbackDelete,
} from './actions';
import { FeedbackState, FeedbackAction } from './types';

export const initialState: FeedbackState = {
  // General feedback
  generalFeedbackShowDeleted: false,
  // Object feedback
  objectFeedbackShowDeleted: false,
  objectFeedbackModalDocumentId: '',
};

const feedbackReducerCreator = createReducer(initialState, (builder) => {
  builder
    .addCase(setObjectFeedbackModalDocumentId, (state, action) => {
      state.objectFeedbackModalDocumentId = action.payload;
    })
    .addCase(clearObjectFeedbackModalDocumentId, (state) => {
      state.objectFeedbackModalDocumentId = undefined;
    })
    .addCase(toggleFeedbackDelete, (state) => {
      state.objectFeedbackShowDeleted = !state.objectFeedbackShowDeleted;
      state.generalFeedbackShowDeleted = !state.generalFeedbackShowDeleted;
    });
});

export const feedback = (
  state: FeedbackState | undefined,
  action: FeedbackAction
): FeedbackState => {
  return feedbackReducerCreator(state, action);
};
