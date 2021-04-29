import { createSlice } from '@reduxjs/toolkit';
import { startPnidParsingWorkflow } from 'modules/contextualization/pnidWorkflow/actions';

export const pnidWorkflowSlice = createSlice({
  name: 'pnidWorkflow',
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      startPnidParsingWorkflow.action.fulfilled,
      startPnidParsingWorkflow.fulfilled
    );
  },
});

export { startPnidParsingWorkflow };
export const { reducer } = pnidWorkflowSlice;
