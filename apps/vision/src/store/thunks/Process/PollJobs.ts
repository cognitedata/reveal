import { createAsyncThunk } from '@reduxjs/toolkit';

import { VisionJob } from '../../../api/vision/detectionModels/types';
import { fetchVisionJobById } from '../../../api/vision/detectionModels/visionJob';
import { removeJobById } from '../../../modules/Process/store/slice';
import { JobState } from '../../../modules/Process/store/types';
import { fetchUntilComplete } from '../../../utils';
import { ToastUtils } from '../../../utils/ToastUtils';
import { ThunkConfig } from '../../rootReducer';

import { VisionJobUpdate } from './VisionJobUpdate';

export const PollJobs = createAsyncThunk<void, JobState[], ThunkConfig>(
  'process/pollJobs',
  async (jobs, { dispatch, getState }) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const job of jobs) {
      const { jobId, fileIds, type: modelType } = job;

      const doesFileExist = (fileId: number) =>
        getState().processSlice.fileIds.includes(fileId);

      fetchUntilComplete<VisionJob>(
        () => fetchVisionJobById(modelType, jobId),
        {
          isCompleted: (latestJobVersion) =>
            latestJobVersion.status === 'Completed' ||
            latestJobVersion.status === 'Failed' ||
            !fileIds.some(doesFileExist),

          onTick: async (latestJobVersion) => {
            if (
              latestJobVersion.status === 'Running' ||
              latestJobVersion.status === 'Completed' ||
              latestJobVersion.status === 'Failed'
            ) {
              await dispatch(
                VisionJobUpdate({
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
        }
      );
    }
  }
);
