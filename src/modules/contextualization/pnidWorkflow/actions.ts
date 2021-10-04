import { createAsyncThunk } from '@reduxjs/toolkit';
import { startPnidParsingJob } from 'modules/contextualization/pnidParsing/actions';
import {
  standardModelOptions,
  loadWorkflowDiagrams,
  loadWorkflowResources,
  workflowDiagramStatusSelector,
  workflowAllResourcesStatusSelector,
  workflowDiagramsSelector,
  workflowAllResourcesSelector,
} from 'modules/workflows';
import { RootState } from 'store';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';

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
        partialMatch = standardModelOptions.partialMatch,
        minTokens = standardModelOptions.minTokens,
        matchFields = standardModelOptions.matchFields,
      } = activeWorkflow?.options;

      if (workflowStatus === 'pending' || workflowStatus === 'success') return;

      await dispatch(loadWorkflowAsync(workflowId));

      const getDiagrams = workflowDiagramsSelector(workflowId, true);
      const getResources = workflowAllResourcesSelector(workflowId, true);

      const state = getState();

      const diagrams = getDiagrams(state);
      const resources = getResources(state);

      const { assets, files } = resources;

      trackUsage(PNID_METRICS.selection, {
        diagrams: diagrams.length,
        assets: assets?.length ?? 0,
        files: files?.length ?? 0,
      });

      trackUsage(PNID_METRICS.configPage.configuration, {
        minTokens,
        partialMatch,
      });

      await dispatch(
        startPnidParsingJob.action({
          diagrams,
          resources: { assets, files },
          options: {
            minTokens,
            partialMatch,
            matchFields,
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
