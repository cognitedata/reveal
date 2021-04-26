import { createAsyncThunk } from '@reduxjs/toolkit';
import { FileInfo, Asset } from '@cognite/sdk';
import { trackTimedUsage } from 'utils/Metrics';
import { startPnidParsingJob } from 'modules/contextualization/pnidParsing/actions';

interface WorkflowStatus {
  completed: boolean;
  workflowId: number;
}

export interface PnidParsingWorkflowStore {
  [key: string]: WorkflowStatus;
}

export const startPnidParsingWorkflow = {
  action: createAsyncThunk(
    'workflow/pnid_parsing_started',
    async (
      {
        workflowId,
        diagrams,
        resources,
      }: { workflowId: number; diagrams: FileInfo[]; resources: any },
      { dispatch, getState }: { dispatch: any; getState: any }
    ) => {
      const state = getState();
      const activeWorkflow = state.workflows.items[workflowId];
      const workflowStatus = activeWorkflow?.status;
      const {
        partialMatch = undefined,
        minTokens = undefined,
      } = activeWorkflow?.options;

      if (workflowStatus === 'pending' || workflowStatus === 'success') return;

      const timer = trackTimedUsage(
        'Contextualization.PnidParsing.StartAllJobs',
        { workflowId }
      );

      const assets = resources!.assets as Asset[];

      await dispatch(
        startPnidParsingJob.action({
          files: diagrams,
          entities: [...assets, ...diagrams],
          options: {
            minTokens,
            partialMatch,
            searchField: 'name',
          },
          workflowId,
          diagrams,
          resources,
        })
      );
      timer.stop();
    }
  ),
  pending: () => {},
  rejected: () => {},
  fulfilled: () => {},
};
