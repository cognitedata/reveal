import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';

import { fetchJobById } from 'src/api/annotationJob';
import { AnnotationJob, AnnotationJobFailedItem } from 'src/api/types';
import { JobState, removeJobById } from 'src/modules/Process/processSlice';
import { fileProcessUpdate } from 'src/store/commonActions';
import { ThunkConfig } from 'src/store/rootReducer';
import { fetchUntilComplete } from 'src/utils';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { AnnotationDetectionJobUpdate } from './AnnotationDetectionJobUpdate';

export const PollJobs = createAsyncThunk<void, JobState, ThunkConfig>(
  'process/pollJobs',
  async (job, { dispatch, getState }) => {
    const {
      jobId,
      fileIds,
      type: modelType,
      completedFileIds: completedFileIdsFromState,
    } = job;
    let completedFileIds: number[] = completedFileIdsFromState || [];
    let failedJobs: AnnotationJobFailedItem[] = [];

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
          const result = await dispatch(
            AnnotationDetectionJobUpdate({
              job: latestJobVersion,
              completedFileIds,
            })
          );
          try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            unwrapResult(result);
            if (
              latestJobVersion.status === 'Running' ||
              latestJobVersion.status === 'Completed'
            ) {
              const newCompletedFileIds =
                latestJobVersion.items
                  ?.map((item) => item.fileId)
                  .filter((item) => !completedFileIds.includes(item)) || [];
              completedFileIds = [...completedFileIds, ...newCompletedFileIds];

              const newFailedJobs =
                latestJobVersion.failedItems?.filter(
                  (newJobs) =>
                    !failedJobs
                      .map((failedJob) => failedJob.items[0].fileId)
                      .includes(newJobs.items[0].fileId)
                ) || [];
              failedJobs = [...failedJobs, ...newFailedJobs];

              if (newCompletedFileIds.length) {
                await dispatch(RetrieveAnnotations(newCompletedFileIds));
              }
              // TODO: use failed job information
            }

            dispatch(
              fileProcessUpdate({
                modelType,
                fileIds,
                job: latestJobVersion,
                completedFileIds,
              })
            );
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
