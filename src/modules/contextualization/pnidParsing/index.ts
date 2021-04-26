import { createSlice } from '@reduxjs/toolkit';
import { startPnidParsingJob } from './actions';
import { PnidsParsingJobSchema } from './types';

const initialState: { [workflowId: number]: PnidsParsingJobSchema } = {};

export const pnidParsingSlice = createSlice({
  name: 'pnidParsing',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      startPnidParsingJob.action.fulfilled,
      startPnidParsingJob.fulfilled
    );
  },
});

export { startPnidParsingJob };
export const { reducer } = pnidParsingSlice;
