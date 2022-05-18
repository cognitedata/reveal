import { fetchVersions, fetchSolution } from './actions';
/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SolutionSchema, Solution } from '@platypus/platypus-core';
import { ActionStatus } from '@platypus-app/types';
import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';

const initialState = {
  solution: undefined as Solution | undefined,
  solutionStatus: ActionStatus.IDLE,
  solutionError: '',
  selectedSchema: {
    schema: '',
    externalId: '',
    status: 'DRAFT',
    version: '1',
    createdTime: Date.now(),
    lastUpdatedTime: Date.now(),
  } as SolutionSchema,
  schemas: [] as SolutionSchema[],
  schemasStatus: ActionStatus.IDLE,
  schemasError: '',
};

const solutionStateSlice = createSlice({
  name: 'solution',
  initialState: initialState,
  reducers: {
    selectVersion: (state, action: PayloadAction<{ version: string }>) => {
      if (state.schemas.length) {
        if (action.payload.version === DEFAULT_VERSION_PATH) {
          state.selectedSchema = state.schemas[0];
        } else {
          state.selectedSchema = state.schemas.find(
            (schema) => schema.version === action.payload.version
          ) as SolutionSchema;
        }
      } else {
        state.selectedSchema = {
          ...initialState.selectedSchema,
          externalId: state.solution!.id,
        };
      }
    },
    setSchema: (state, action: PayloadAction<SolutionSchema>) => {
      state.selectedSchema = action.payload;
    },
    insertSchema: (state, action: PayloadAction<SolutionSchema>) => {
      state.schemas = [action.payload, ...state.schemas];
    },
  },
  extraReducers: (builder) => {
    // Fetching solution
    builder.addCase(fetchSolution.pending, (state) => {
      state.solutionStatus = ActionStatus.PROCESSING;
    });
    builder.addCase(fetchSolution.fulfilled, (state, action) => {
      state.solutionStatus = ActionStatus.SUCCESS;
      state.solution = action.payload;
    });
    builder.addCase(fetchSolution.rejected, (state, action) => {
      state.solutionStatus = ActionStatus.FAIL;
      state.solutionError = action.error.message as string;
    });

    // Fetching versions
    builder.addCase(fetchVersions.pending, (state) => {
      state.schemasStatus = ActionStatus.PROCESSING;
    });
    builder.addCase(fetchVersions.fulfilled, (state, action) => {
      state.schemasStatus = ActionStatus.SUCCESS;
      state.schemas = action.payload;
      state.selectedSchema = action.payload.length
        ? action.payload[0]
        : initialState.selectedSchema;
    });
    builder.addCase(fetchVersions.rejected, (state, action) => {
      state.schemasStatus = ActionStatus.FAIL;
      state.schemasError = action.error.message as string;
    });
  },
});

export type SolutionState = ReturnType<typeof solutionStateSlice.reducer>;
export const { actions } = solutionStateSlice;
export default solutionStateSlice;
