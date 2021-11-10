import { createAsyncThunk } from '@reduxjs/toolkit';
import { FileInfo } from '@cognite/sdk';
import chunk from 'lodash/chunk';
import { RootState } from 'store';
import {
  resetWorkflowJobs,
  standardModelOptions,
  workflowDiagramsSelector,
  workflowAllResourcesSelector,
} from 'modules/workflows';
import { PnidsParsingJobSchema } from 'modules/types';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import { loadWorkflowAsync } from '../utils';
import { startPnidParsingJob } from './parsingJobs';

const CHUNK_SIZE = 50;

/**
 * Starts the diagram parsing workflow.
 * @param workflowId
 */
export const startPnidParsingWorkflow = {
  action: createAsyncThunk(
    'workflow/startPnidParsingWorkflow',
    async (
      _: void,
      { dispatch, getState }: { dispatch: any; getState: any }
    ) => {
      const workflowId = getState().workflows.active;
      const workflow = getState().workflows.items[workflowId];

      const {
        partialMatch = standardModelOptions.partialMatch,
        minTokens = standardModelOptions.minTokens,
        matchFields = standardModelOptions.matchFields,
      } = workflow?.options;
      const { list: workflowJobs = [], status: workflowStatus } =
        workflow?.jobs;

      await dispatch(loadWorkflowAsync(workflowId));
      if (workflowStatus === 'running' || workflowStatus === 'done') return;

      const getResources = workflowAllResourcesSelector(workflowId, true);
      const getDiagrams = workflowDiagramsSelector(workflowId, true);

      const state: RootState = getState();

      const { assets, files } = getResources(state);
      const diagrams = getDiagrams(state);

      const shouldRemoveOldJobResults = !workflowJobs.length;
      const areJobsAlreadyRunning =
        workflowJobs.length &&
        workflowJobs.some(
          (job: PnidsParsingJobSchema) => job.status === 'running'
        );

      if (areJobsAlreadyRunning) return;
      if (shouldRemoveOldJobResults) dispatch(resetWorkflowJobs({}));

      trackUsage(PNID_METRICS.configPage.configuration, {
        minTokens,
        partialMatch,
      });
      trackUsage(PNID_METRICS.selection, {
        diagrams: diagrams.length,
        assets: assets?.length ?? 0,
        files: files?.length ?? 0,
      });

      const chunkedDiagrams = chunk(diagrams, CHUNK_SIZE).map(
        (diagramsChunk: FileInfo[]) =>
          dispatch(
            startPnidParsingJob.action({
              workflowJobs: getState().workflows.items[workflowId].jobs.list,
              diagrams: diagramsChunk,
              resources: { assets, files },
              options: {
                minTokens,
                partialMatch,
                matchFields,
              },
              workflowId,
            })
          )
      );

      await Promise.all(chunkedDiagrams);
    }
  ),
  pending: () => {},
  rejected: () => {},
  fulfilled: () => {},
};
