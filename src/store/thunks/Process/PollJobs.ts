import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchJobById } from 'src/api/annotationJob';
import { AnnotationJob } from 'src/api/types';
import { JobState, removeJobById } from 'src/modules/Process/processSlice';
import { ThunkConfig } from 'src/store/rootReducer';
import { fetchUntilComplete } from 'src/utils';
import { ToastUtils } from 'src/utils/ToastUtils';
import { AnnotationDetectionJobUpdate } from './AnnotationDetectionJobUpdate';

export const PollJobs = createAsyncThunk<void, JobState[], ThunkConfig>(
  'process/pollJobs',
  async (jobs, { dispatch, getState }) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const job of jobs) {
      const { jobId, fileIds, type: modelType } = job;

      const doesFileExist = (fileId: number) =>
        getState().processSlice.fileIds.includes(fileId);

      fetchUntilComplete<AnnotationJob>(() => fetchJobById(modelType, jobId), {
        isCompleted: (latestJobVersion) =>
          latestJobVersion.status === 'Completed' ||
          latestJobVersion.status === 'Failed' ||
          !fileIds.some(doesFileExist),

        onTick: async (latestJobVersion) => {
          if (
            latestJobVersion.status === 'Running' ||
            latestJobVersion.status === 'Completed'
          ) {
            await dispatch(
              AnnotationDetectionJobUpdate({
                job: latestJobVersion,
                fileIds,
                modelType,
              })
            ).unwrap();
          }
        },

        onError: (error: Error) => {
          const formattedError = `Error occurred while fetching jobs: ${JSON.stringify(
            error.message,
            null,
            4
          )}`;
          ToastUtils.onFailure(formattedError);

          if (job.status === 'Queued' && job.jobId < 0) {
            dispatch(removeJobById(job.jobId));
          }

          // eslint-disable-next-line no-console
          console.error(error);
        },
      });
    }
  }
);
