import { createAsyncThunk } from '@reduxjs/toolkit';
import { JobState } from 'src/modules/Process/processSlice';
import { ThunkConfig } from 'src/store/rootReducer';
import { splitListIntoChunks } from 'src/utils/generalUtils';
import { PollJobs } from './PollJobs';

export const ResumeAnnotationJobs = createAsyncThunk<
  void,
  { fileIds: Array<number>; unfinishedJobs: JobState[] },
  ThunkConfig
>(
  'process/resumeAnnotationJobs',
  async ({ fileIds, unfinishedJobs }, { dispatch, getState }) => {
    const {
      files,
      jobs,
      selectedDetectionModels: detectionModels,
    } = getState().processSlice;

    // API can handle 1000 files in one request
    // Adding batching for future proofing
    const batchSize = 1000;
    const batchFileIdsList: number[][] = splitListIntoChunks(
      fileIds,
      batchSize
    );

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

        unfinishedJobs.forEach(async (unfinishedJob) => {
          dispatch(
            PollJobs({ job: unfinishedJob, filteredBatchFileIds, modelType })
          );
        });
      });
    });
  }
);
