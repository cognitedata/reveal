import { createSlice } from '@reduxjs/toolkit';
import { PnidsParsingJobSchema } from 'modules/types';
import { startPnidParsingJob } from './actions';

const initialState: { [workflowId: number]: PnidsParsingJobSchema } = {};

export const pnidParsingSlice = createSlice({
  name: 'pnidParsing',
  initialState,
  reducers: {
    resetJob: (state, action) => {
      const { workflowId } = action.payload;
      state[workflowId] = {};
    },
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
      const {
        workflowId,
        annotationCounts,
        statusCount,
        failedFiles,
      } = action.payload;
      state[workflowId] = {
        ...state[workflowId],
        statusCount,
        status: 'Completed',
        annotationCounts,
        failedFiles,
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
  resetJob,
} = pnidParsingSlice.actions;
