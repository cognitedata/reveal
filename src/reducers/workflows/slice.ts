import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  Update,
} from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { LoadingStatus } from 'reducers/types';
import { ValueOf } from 'typings/utils';
import { StorableNode, Workflow } from './types';

const workflowAdapter = createEntityAdapter<Workflow>({
  selectId: (workflow) => workflow.id,
});

const workflowSlice = createSlice({
  name: 'workflows',
  initialState: workflowAdapter.getInitialState({
    status: { status: 'IDLE' } as LoadingStatus,
  }),
  reducers: {
    // Loading workflows
    startLoadingWorkflows: (state) => {
      state.status.status = 'LOADING';
    },
    finishedLoadingWorkflows: (state, action: PayloadAction<Workflow[]>) => {
      state.status.status = 'SUCCESS';
      workflowAdapter.addMany(state, action.payload);
    },
    failedLoadingWorkflows: (state, action: PayloadAction<Error>) => {
      state.status.status = 'FAILED';
      state.status.error = action.payload;
    },

    // Making new workflow
    startStoringNewWorkflow: (state) => {
      state.status.status = 'LOADING';
    },
    storedNewWorkflow: (state, action: PayloadAction<Workflow>) => {
      state.status.status = 'SUCCESS';
      workflowAdapter.addOne(state, action.payload);
    },
    failedStoringNewWorkflow: (state, action: PayloadAction<Error>) => {
      state.status.status = 'FAILED';
      state.status.error = action.payload;
    },

    deleteWorkflow: (state, action: PayloadAction<Workflow>) => {
      workflowAdapter.removeOne(state, action.payload.id);
    },

    // Editing workflow
    updateWorkflow: (state, action: PayloadAction<Update<Workflow>>) => {
      workflowAdapter.updateOne(state, action.payload);
    },
    updateNode: (
      state,
      action: PayloadAction<{
        workflowId: string;
        nodeUpdate: Update<StorableNode>;
      }>
    ) => {
      const { workflowId, nodeUpdate } = action.payload;
      workflowAdapter.updateOne(state, {
        id: workflowId,
        changes: {
          ...state.entities[workflowId],
          nodes: state.entities[workflowId]?.nodes.map((node) => {
            if (node.id === nodeUpdate.id) {
              return {
                ...node,
                ...nodeUpdate.changes,
              };
            }
            return node;
          }),
        },
      });
    },
  },
});

export default workflowSlice;

export type WorkflowAction = ReturnType<ValueOf<typeof workflowSlice.actions>>;
export type WorkflowState = ReturnType<typeof workflowSlice.reducer>;

export const workflowSelectors = workflowAdapter.getSelectors<RootState>(
  (state) => state.workflows
);
