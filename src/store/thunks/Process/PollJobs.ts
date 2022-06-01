import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchVisionJobById } from 'src/api/vision/detectionModels/visionJob';
import { VisionJob } from 'src/api/vision/detectionModels/types';
import { removeJobById } from 'src/modules/Process/store/slice';
import { JobState } from 'src/modules/Process/store/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { fetchUntilComplete } from 'src/utils';
import { ToastUtils } from 'src/utils/ToastUtils';
import { VisionJobUpdateV1 } from './VisionJobUpdateV1';

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
              latestJobVersion.status === 'Completed'
            ) {
              await dispatch(
                VisionJobUpdateV1({
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
