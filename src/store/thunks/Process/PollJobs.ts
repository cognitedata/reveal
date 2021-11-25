import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';

import { fetchJobById } from 'src/api/annotationJob';
import { AnnotationJob } from 'src/api/types';
import { JobState, removeJobById } from 'src/modules/Process/processSlice';
import { ThunkConfig } from 'src/store/rootReducer';
import { fetchUntilComplete } from 'src/utils';
import { AnnotationDetectionJobUpdate } from './AnnotationDetectionJobUpdate';

export const PollJobs = createAsyncThunk<void, JobState, ThunkConfig>(
  'process/pollJobs',
  async (job, { dispatch, getState }) => {
    const {
      jobId,
      fileIds,
      type: modelType,
      completedFileIds: completedFileIdsFromState,
      failedFileIds: failedFileIdsFromState,
    } = job;
    const completedFileIds: number[] = completedFileIdsFromState || [];
    const failedFileIds: number[] = failedFileIdsFromState || [];

    const doesFileExist = (fileId: number) =>
      getState().filesSlice.files.byId[fileId];

    await fetchUntilComplete<AnnotationJob>(
      () => fetchJobById(modelType, jobId),
      {
        isCompleted: (latestJobVersion) =>
          latestJobVersion.status === 'Completed' ||
          latestJobVersion.status === 'Failed' ||
          !fileIds.some(doesFileExist), // we don't want to poll jobs for removed files

        onTick: async (latestJobVersion) => {
          try {
            if (
              latestJobVersion.status === 'Running' ||
              latestJobVersion.status === 'Completed'
            ) {
              const result = await dispatch(
                AnnotationDetectionJobUpdate({
                  job: latestJobVersion,
                  fileIds,
                  modelType,
                  completedFileIds,
                  failedFileIds,
                })
              );
              unwrapResult(result);
            }
          } catch (error) {
            // TODO: use failed file Ids
            console.error(error);
          }
        },

        onError: (error) => {
          dispatch(removeJobById(job.jobId));
          // eslint-disable-next-line no-console
          console.error(error); // todo better error handling of polling errors
        },
      }
    );
  }
);
