import { createSlice } from '@reduxjs/toolkit';
import { PnidsParsingJobSchema } from 'modules/types';
import { startPnidParsingJob } from './actions';

const initialState: { [workflowId: number]: PnidsParsingJobSchema } = {};

export const pnidParsingSlice = createSlice({
  name: 'pnidParsing',
  initialState,
  reducers: {
    createJob: (state, action) => {
      const { workflowId, initialValue } = action.payload;
      state[workflowId] = initialValue;
    },
    updateJob: (state, action) => {
      const { workflowId, status, statusCount } = action.payload;
      state[workflowId] = {
        ...state[workflowId],
        status,
        statusCount,
      };
    },
    rejectJob: (state, action) => {
      const { workflowId } = action.payload;
      state[workflowId] = {
        ...state[workflowId],
        status: 'Failed',
      };
    },
    finishJob: (state, action) => {
      const { workflowId, annotationCounts } = action.payload;
      state[workflowId] = {
        ...state[workflowId],
        annotationCounts,
      };
    },
  },
});

export { startPnidParsingJob };
export const { reducer } = pnidParsingSlice;
export const {
  createJob,
  updateJob,
  rejectJob,
  finishJob,
} = pnidParsingSlice.actions;
