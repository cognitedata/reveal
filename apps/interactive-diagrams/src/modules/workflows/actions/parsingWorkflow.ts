import { PnidsParsingJobSchema } from '@interactive-diagrams-app/modules/types';
import {
  resetWorkflowJobs,
  standardModelOptions,
  workflowDiagramsSelector,
  workflowAllResourcesSelector,
} from '@interactive-diagrams-app/modules/workflows';
import { RootState } from '@interactive-diagrams-app/store';
import {
  PNID_METRICS,
  trackUsage,
} from '@interactive-diagrams-app/utils/Metrics';
import { createAsyncThunk } from '@reduxjs/toolkit';
import chunk from 'lodash/chunk';
import noop from 'lodash/noop';

import { FileInfo } from '@cognite/sdk';

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
  pending: noop,
  rejected: noop,
  fulfilled: noop,
};
