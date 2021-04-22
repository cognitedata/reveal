import { createAsyncThunk } from '@reduxjs/toolkit';
import { FileInfo, Asset } from '@cognite/sdk';
import chunk from 'lodash/chunk';
import { removeExtension } from 'utils/AnnotationUtils';
import { trackTimedUsage } from 'utils/Metrics';
// import { listAnnotations } from 'modules/annotations';
import { startPnidParsingJob } from 'modules/contextualization/parsingJobs';

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
        grayscale = undefined,
        minTokens = undefined,
      } = activeWorkflow?.options;

      if (workflowStatus === 'pending' || workflowStatus === 'success') return;

      const timer = trackTimedUsage(
        'Contextualization.PnidParsing.StartAllJobs',
        { workflowId }
      );

      const assets = resources!.assets as Asset[];
      const assetNames: string[] = assets.map((i) => i.name);
      const chunkedDiagrams: FileInfo[][] = chunk(diagrams, 30);
      chunkedDiagrams.reduce(
        async (previousPromise: Promise<any>, nextChunk) => {
          await previousPromise;
          return Promise.all(
            nextChunk.map(async (diagram: FileInfo) => {
              await dispatch(
                startPnidParsingJob(
                  diagram,
                  assetNames.concat(
                    diagrams
                      .filter((d: FileInfo) => d.id !== diagram.id)
                      .map((d: FileInfo) => d.name)
                      .map(removeExtension)
                  ),
                  { partialMatch, grayscale, minTokens },
                  workflowId,
                  diagrams,
                  resources
                )
              );
            })
          );
        },
        Promise.resolve()
      );
      timer.stop();
    }
  ),
  pending: () => {},
  rejected: () => {},
  fulfilled: () => {},
};
