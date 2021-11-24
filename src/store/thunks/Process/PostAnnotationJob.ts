import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  AnnotationJob,
  AnnotationJobFailedItem,
  DetectionModelParams,
  VisionAPIType,
} from 'src/api/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { createAnnotationJob, fetchJobById } from 'src/api/annotationJob';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { AnnotationDetectionJobUpdate } from 'src/store/thunks/Process/AnnotationDetectionJobUpdate';
import { fetchUntilComplete } from 'src/utils';
import { fileProcessUpdate } from 'src/store/commonActions';
import { removeJobById, State } from 'src/modules/Process/processSlice';

export const postAnnotationJob = createAsyncThunk<
  AnnotationJob,
  { modelType: VisionAPIType; fileIds: number[] },
  ThunkConfig
>(
  'process/postAnnotationJobs',
  async ({ modelType, fileIds }, { dispatch, getState }) => {
    const params = getDetectionModelParameters(
      getState().processSlice,
      modelType
    );
    const createdJob = await createAnnotationJob(modelType, fileIds, params);

    const doesFileExist = (fileId: number) =>
      getState().filesSlice.files.byId[fileId];

    let completedFileIds: number[] = [];
    let failedJobs: AnnotationJobFailedItem[] = [];

    await fetchUntilComplete<AnnotationJob>(
      () => fetchJobById(createdJob.type, createdJob.jobId),
      {
        isCompleted: (latestJobVersion) =>
          latestJobVersion.status === 'Completed' ||
          latestJobVersion.status === 'Failed' ||
          !fileIds.some(doesFileExist), // we don't want to poll jobs for removed files

        onTick: async (latestJobVersion) => {
          await dispatch(
            AnnotationDetectionJobUpdate({
              job: latestJobVersion,
              completedFileIds,
            })
          );
          if (
            latestJobVersion.status === 'Running' ||
            latestJobVersion.status === 'Completed'
          ) {
            const newCompeletedFileIds =
              latestJobVersion.items
                ?.map((item) => item.fileId)
                .filter((item) => !completedFileIds.includes(item)) || [];
            completedFileIds = [...completedFileIds, ...newCompeletedFileIds];

            const newFailedJobs =
              latestJobVersion.failedItems?.filter(
                (newJobs) =>
                  !failedJobs
                    .map((jobs) => jobs.items[0].fileId)
                    .includes(newJobs.items[0].fileId)
              ) || [];
            failedJobs = [...failedJobs, ...newFailedJobs];

            if (newCompeletedFileIds.length) {
              await dispatch(
                RetrieveAnnotations({
                  fileIds: newCompeletedFileIds,
                  clearCache: false,
                })
              );
            }
            // TODO: use failed job information
          }
          dispatch(
            fileProcessUpdate({
              modelType,
              fileIds,
              job: latestJobVersion,
            })
          );
        },

        onError: (error) => {
          dispatch(removeJobById(createdJob.jobId));
          // eslint-disable-next-line no-console
          console.error(error); // todo better error handling of polling errors
        },
      }
    );

    return createdJob;
  }
);

const getDetectionModelParameters = (
  state: State,
  modelType: VisionAPIType
): DetectionModelParams | undefined => {
  return state.availableDetectionModels.find((item) => item.type === modelType)
    ?.settings;
};
