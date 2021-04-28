import { createSlice } from '@reduxjs/toolkit';
import { startPnidParsingJob } from './actions';
import { PnidsParsingJobSchema } from './types';

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
      const { workflowId, status } = action.payload;
      state[workflowId] = status;
    },
    finishJob: (state, action) => {
      const { workflowId, results } = action.payload;
      state[workflowId] = results;
    },
  },
});

export { startPnidParsingJob };
export const { reducer } = pnidParsingSlice;
export const { createJob, updateJob, finishJob } = pnidParsingSlice.actions;
