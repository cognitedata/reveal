import { createAsyncThunk } from '@reduxjs/toolkit';

import { fetchJobById } from 'src/api/annotationJob';
import {
  AnnotationJob,
  AnnotationJobFailedItem,
  DetectionModelParams,
  VisionAPIType,
} from 'src/api/types';
import { removeJobById, State } from 'src/modules/Process/processSlice';
import { fileProcessUpdate } from 'src/store/commonActions';
import { ThunkConfig } from 'src/store/rootReducer';
import { fetchUntilComplete } from 'src/utils';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { isVideo } from 'src/modules/Common/Components/FileUploader/utils/FileUtils';
import { splitListIntoChunks } from 'src/utils/generalUtils';
import { AnnotationDetectionJobUpdate } from './AnnotationDetectionJobUpdate';

export const pollJobs = createAsyncThunk<
  void,
  { fileIds: Array<number> },
  ThunkConfig
>('process/pollJobs', async ({ fileIds }, { dispatch, getState }) => {
  // const detectionModels = getState().processSlice.selectedDetectionModels;
  const {
    files,
    jobs,
    selectedDetectionModels: detectionModels,
  } = getState().processSlice;

  // API can handle 1000 files in one request
  // Adding batching for future proofing
  const batchSize = 1000;
  const batchFileIdsList: number[][] = splitListIntoChunks(fileIds, batchSize);

  console.log('polling...', fileIds);
  batchFileIdsList.forEach((batchFileIds) => {
    detectionModels.forEach(async (modelType) => {
      const filteredBatchFileIds = batchFileIds.filter((fileId: number) => {
        const fileJobIds = files.byId[fileId]?.jobIds;
        return (
          !fileJobIds ||
          !fileJobIds
            .map((jobId) => jobs.byId[jobId])
            .some((job) => job.type === modelType)
        );
      });

      // dispatch(
      //   postAnnotationJob({
      //     modelType,
      //     fileIds: filteredBatchFileIds,
      //   })
      // );

      const params = getDetectionModelParameters(
        getState().processSlice,
        modelType
      );
      // const createdJob = await createAnnotationJob(modelType, fileIds, params);
      const createdJob = jobs.byId[jobs.allIds[1]];

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
              const newCompletedFileIds =
                latestJobVersion.items
                  ?.map((item) => item.fileId)
                  .filter((item) => !completedFileIds.includes(item)) || [];
              completedFileIds = [...completedFileIds, ...newCompletedFileIds];

              const newFailedJobs =
                latestJobVersion.failedItems?.filter(
                  (newJobs) =>
                    !failedJobs
                      .map((fjobs) => fjobs.items[0].fileId)
                      .includes(newJobs.items[0].fileId)
                ) || [];
              failedJobs = [...failedJobs, ...newFailedJobs];

              if (newCompletedFileIds.length) {
                await dispatch(RetrieveAnnotations(newCompletedFileIds));
              }
              // TODO: use failed job information
            }
            console.log('polling...');

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
    });
  });
});

const getDetectionModelParameters = (
  state: State,
  modelType: VisionAPIType
): DetectionModelParams | undefined => {
  switch (modelType) {
    case VisionAPIType.OCR: {
      return state.detectionModelParameters.ocr;
    }
    case VisionAPIType.TagDetection: {
      return state.detectionModelParameters.tagDetection;
    }
    case VisionAPIType.ObjectDetection: {
      return state.detectionModelParameters.objectDetection;
    }
    default: {
      return undefined;
    }
  }
};
