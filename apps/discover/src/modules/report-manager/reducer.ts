import { createReducer } from '@reduxjs/toolkit';

import { reportManagerActions } from './actions';
import { ReportManagerAction, ReportManagerState } from './types';

export const initialState: ReportManagerState = {
  wellFeedback: { visible: false },
};

const { setWellFeedback } = reportManagerActions;

const reportManagerReducerCreator = createReducer(initialState, (builder) => {
  builder.addCase(setWellFeedback, (state, action) => {
    if (action.payload.visible) {
      state.wellFeedback = action.payload;
    } else {
      state.wellFeedback = {
        visible: action.payload.visible,
        wellboreMatchingId: undefined,
        dataSet: undefined,
      };
    }
  });
});

export const reportManager = (
  state: ReportManagerState | undefined,
  action: ReportManagerAction
): ReportManagerState => {
  return reportManagerReducerCreator(state, action);
};
