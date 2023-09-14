import { createAsyncThunk } from '@reduxjs/toolkit';

import sdk from '@cognite/cdf-sdk-singleton';
import { FileInfo } from '@cognite/sdk';

import handleError from '../../../utils/handleError';
import { PNID_METRICS, trackUsage } from '../../../utils/Metrics';
import { StartPnidParsingJobProps, PollJobResultsProps } from '../../types';
import {
  mapAssetsToEntities,
  mapFilesToEntities,
  handleNewAnnotations,
} from '../utils';

import {
  workflowDiagramsSelector,
  createJob,
  updateJob,
  finishJob,
  rejectJob,
  rejectModel,
} from './..';

const MAX_RETRIES = 20;
const RETRYDELAY = 20000; // in ms

const pnidApiRootPath = (project: string) =>
  `/api/v1/projects/${project}/context/diagram`;
const createPnidDetectJobPath = (project: string) =>
  `${pnidApiRootPath(project)}/detect`;
const getPnidDetectJobPath = (project: string, jobId: number) =>
  `${pnidApiRootPath(project)}/detect/${jobId}`;

export const startPnidParsingJob = {
  action: createAsyncThunk(
    'workflow/startPnidParsingJob',
    async (
      parsingJobProps: StartPnidParsingJobProps,
      { dispatch }: { dispatch: any }
    ) => {
      const {
        workflowJobs,
        diagrams,
        resources,
        options,
        workflowId,
        retries = 0,
      } = parsingJobProps;
      const diagramIds: number[] = diagrams.map((d) => d.id);
      const existingJob = workflowJobs.find((job) =>
        diagramIds.every((id) => job.items?.some((item) => item.fileId === id))
      );
      const isJobCreatedButNotPolled =
        workflowJobs.length && existingJob?.jobId;

      if (isJobCreatedButNotPolled) {
        dispatch(
          pollJobResults.action({
            jobId: existingJob!.jobId!,
            workflowId,
          })
        );
      }
      // Job not created yet, so need to create it
      try {
        const userDefinedField = 'userDefinedField';
        const { matchFields, ...otherOptions } = options;

        const mappedDiagrams = diagrams.map((diagram: FileInfo) => ({
          fileId: diagram.id,
        }));

        const mappedResources = [
          ...mapAssetsToEntities(
            resources.assets,
            matchFields.assets,
            userDefinedField
          ),
          ...mapFilesToEntities(
            resources.files,
            matchFields.files,
            userDefinedField
          ),
        ];

        const response = await sdk.post(createPnidDetectJobPath(sdk.project), {
          data: {
            items: mappedDiagrams,
            entities: mappedResources,
            searchField: userDefinedField,
            ...otherOptions,
          },
        });

        const {
          status: httpStatus,
          data: { jobId, status },
        } = response;

        trackUsage(PNID_METRICS.parsingJob.start, {
          jobId,
        });

        // Mark job as started
        dispatch(createJob({ initialValue: { jobId, status } }));

        // poll for results
        if (httpStatus === 200) {
          dispatch(pollJobResults.action({ jobId, workflowId }));
        }
        return jobId;
      } catch (e: any) {
        const { status = undefined } = e;
        if (status === 429 && retries < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, RETRYDELAY));
          dispatch(
            startPnidParsingJob.action({
              ...parsingJobProps,
              retries: retries + 1,
            })
          );
          throw e;
        }

        handleError({ ...e });
        dispatch(rejectModel({}));
        throw e;
      }
    }
  ),
};

export const pollJobResults = {
  action: createAsyncThunk(
    'workflow/pollJobResults',
    async (
      { jobId, workflowId }: PollJobResultsProps,
      { getState, dispatch }: { getState: () => any; dispatch: any }
    ) => {
      try {
        const state = getState();
        const { data } = await sdk.get(
          getPnidDetectJobPath(sdk.project, jobId)
        );
        const { status, items = [], statusCount } = data;
        const getDiagrams = workflowDiagramsSelector(workflowId, true);

        const diagrams = getDiagrams(state);

        const isJobFinished = status === 'Completed' || status === 'Failed';

        if (isJobFinished) {
          trackUsage(PNID_METRICS.parsingJob.end, {
            jobId,
            status,
          });

          if (status === 'Completed') {
            trackUsage(PNID_METRICS.parsingJob.results, {
              failed: statusCount?.failed ?? 0,
              completed: statusCount?.completed ?? 0,
            });
            const { annotationCounts, failedFiles } =
              await handleNewAnnotations(diagrams, items, jobId);
            dispatch(
              finishJob({
                jobId,
                statusCount,
                annotationCounts,
                failedFiles,
              })
            );
          } else {
            dispatch(rejectJob({ jobId }));
          }
        } else {
          dispatch(
            updateJob({
              jobId,
              status,
              statusCount,
            })
          );
        }
      } catch (error) {
        // @ts-ignore ignoring for the sake of this migration
        handleError(error);
      }
    }
  ),
};
