// for requested files, create annotation jobs with requested detectionModels and setup polling on these jobs
import { createAsyncThunk } from '@reduxjs/toolkit';
import { VisionDetectionModelType } from '@vision/api/vision/detectionModels/types';
import { ThunkConfig } from '@vision/store/rootReducer';
import { CreateVisionJob } from '@vision/store/thunks/Process/CreateVisionJob';
import { splitListIntoChunks } from '@vision/utils/generalUtils';

export const RunDetectionModels = createAsyncThunk<
  void,
  { fileIds: Array<number>; detectionModels: Array<VisionDetectionModelType> },
  ThunkConfig
>(
  'process/runDetectionModels',
  async ({ fileIds, detectionModels }, { dispatch, getState }) => {
    if (!detectionModels.length) {
      throw new Error(
        'To detect annotations at least one detection model must be selected'
      );
    }

    // API can handle 100 files in one request
    // Adding batching for future proofing
    const batchSize = 100;
    const { files, jobs } = getState().processSlice;
    const batchFileIdsList: number[][] = splitListIntoChunks(
      fileIds,
      batchSize
    );

    batchFileIdsList.forEach((batchFileIds) => {
      detectionModels.forEach((modelType) => {
        const filteredBatchFileIds = batchFileIds.filter((fileId: number) => {
          const fileJobIds = files.byId[fileId]?.jobIds;
          return (
            !fileJobIds ||
            !fileJobIds
              .map((jobId) => jobs.byId[jobId])
              .some((job) => job.type === modelType)
          );
        });

        if (filteredBatchFileIds.length) {
          // post jobs only if number of unprocess files in that model type isn't 0
          dispatch(
            CreateVisionJob({
              modelType,
              fileIds: filteredBatchFileIds,
            })
          );
        }
      });
    });
  }
);
