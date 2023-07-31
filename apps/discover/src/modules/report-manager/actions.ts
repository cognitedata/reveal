import { createAction } from '@reduxjs/toolkit';

import { SetWellFeedback, SET_WELL_FEEDBACK } from './types';

const setWellFeedback =
  createAction<SetWellFeedback['payload']>(SET_WELL_FEEDBACK);

export const reportManagerActions = {
  setWellFeedback,
};
