import { createAsyncThunk } from '@reduxjs/toolkit';
import { startPnidParsingJob } from 'modules/contextualization/pnidParsing/actions';
import { RootState } from 'store';
import {
  loadWorkflowDiagrams,
  loadWorkflowResources,
  workflowDiagramStatusSelector,
  workflowAllResourcesStatusSelector,
  workflowDiagramsSelector,
  workflowAllResourcesSelector,
} from 'modules/workflows';

interface WorkflowStatus {
  completed: boolean;
  workflowId: number;
}

export interface PnidParsingWorkflowStore {
  [key: string]: WorkflowStatus;
}

/**
 * Starts the diagram parsing workflow.
 * @param workflowId
 */
export const startPnidParsingWorkflow = {
  action: createAsyncThunk(
    'workflow/workflow_started',
    async (
      workflowId: number,
      { dispatch, getState }: { dispatch: any; getState: any }
    ) => {
      const activeWorkflow = getState().workflows.items[workflowId];
      const workflowStatus = activeWorkflow?.status;
      const {
        partialMatch = undefined,
        minTokens = undefined,
      } = activeWorkflow?.options;

      if (workflowStatus === 'pending' || workflowStatus === 'success') return;

      await dispatch(loadWorkflowAsync(workflowId));

      const getDiagrams = workflowDiagramsSelector(workflowId, true);
      const getResources = workflowAllResourcesSelector(workflowId, true);

      const state = getState();

      const diagrams = getDiagrams(state);
      const resources = getResources(state);

      const { assets, files } = resources;

      await dispatch(
        startPnidParsingJob.action({
          diagrams,
          resources: { assets, files },
          options: {
            minTokens,
            partialMatch,
            searchField: 'name',
          },
          workflowId,
        })
      );
    }
  ),
  pending: () => {},
  rejected: () => {},
  fulfilled: () => {},
};

/**
 * Asynchronically loads workflow's resources if they weren't previously loaded.
 * @param workflowId
 * @returns
 */
export const loadWorkflowAsync = (workflowId: number) => {
  return async (dispatch: any, getState: () => RootState) => {
    const loadDiagrams = async () => {
      const diagramsStatus = workflowDiagramStatusSelector(
        workflowId,
        true
      )(getState());
      if (!diagramsStatus.done && !diagramsStatus.loading) {
        await dispatch(loadWorkflowDiagrams({ workflowId, loadAll: true }));
      }
      return Promise.resolve();
    };
    const loadResources = async () => {
      const resourcesStatus = workflowAllResourcesStatusSelector(
        workflowId,
        true
      )(getState());
      if (!resourcesStatus.done && !resourcesStatus.loading) {
        await dispatch(loadWorkflowResources({ workflowId, loadAll: true }));
      }
      return Promise.resolve();
    };
    await loadDiagrams();
    await loadResources();
    return Promise.resolve();
  };
};
