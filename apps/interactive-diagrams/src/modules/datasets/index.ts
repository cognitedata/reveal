import { createSlice } from '@reduxjs/toolkit';
import { DataSet } from '@cognite/sdk';
import { Status } from '../sdk-builder/types';
import { listDatasets, mergeDatasets } from './datasets';

type DatasetsState = {
  items: { [key: number]: DataSet };
  resourceCount: any;
  status: Status;
  countsDone: boolean;
};

export const datasetsSlice = createSlice({
  name: 'dataSets',
  initialState: {
    items: {},
    resourceCount: {},
    status: undefined,
    countsDone: false,
  } as DatasetsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listDatasets.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(listDatasets.rejected, (state) => {
        state.status = 'error';
      })
      .addCase(listDatasets.fulfilled, (state, action) => {
        if (!action.payload.result) return;
        const { result } = action.payload;
        state.status = 'success';
        state.items = mergeDatasets(state.items, result);
      });
  },
});

export const { reducer } = datasetsSlice;
export { listDatasets as list };
export * from './selectors';
