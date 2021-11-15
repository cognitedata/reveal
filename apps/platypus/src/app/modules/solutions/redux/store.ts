import { createSlice } from '@reduxjs/toolkit';
import { ActionStatus } from '@platypus-app/types';
import { SolutionsStateVM } from '../types';
import { fetchSolutions } from './actions';

const solutionsInitialState = {
  solutions: [],
  solutionsStatus: ActionStatus.IDLE,
  error: '',
} as SolutionsStateVM;

const solutionsSlice = createSlice({
  name: 'solutions',
  initialState: solutionsInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSolutions.pending, (state) => {
      state.solutionsStatus = ActionStatus.PROCESSING;
    });
    builder.addCase(fetchSolutions.fulfilled, (state, action) => {
      state.solutionsStatus = ActionStatus.SUCCESS;
      state.solutions = action.payload;
    });
    builder.addCase(fetchSolutions.rejected, (state, action) => {
      state.solutionsStatus = ActionStatus.FAIL;
      state.error = action.error.message as string;
    });
  },
});

export type SolutionsState = ReturnType<typeof solutionsSlice.reducer>;
export const { actions } = solutionsSlice;
export default solutionsSlice;
