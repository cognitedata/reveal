import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';

import { convertVisionJobResultsToUnsavedVisionAnnotations } from '../../../api/vision/detectionModels/converters';
import {
  VisionJob,
  VisionDetectionModelType,
  VisionJobRunning,
  VisionJobCompleted,
} from '../../../api/vision/detectionModels/types';
import {
  UnsavedVisionAnnotation,
  VisionAnnotation,
  VisionAnnotationDataType,
} from '../../../modules/Common/types';
import { ToastUtils } from '../../../utils/ToastUtils';
import { fileProcessUpdate } from '../../commonActions';
import { ThunkConfig } from '../../rootReducer';
import { RetrieveAnnotations } from '../Annotation/RetrieveAnnotations';
import { SaveAnnotations } from '../Annotation/SaveAnnotations';

const getNewFailedFileIds = ({
  job,
  failedFileIds,
}: {
  job: (VisionJobRunning | VisionJobCompleted) & {
    type: VisionDetectionModelType;
  };
  failedFileIds: number[];
}) => {
  // loop failed items (sub jobs) and show error notification for new failed items
  if (job.failedItems && job.failedItems.length) {
    job.failedItems.forEach((failedItem) => {
      if (
        !failedItem.items.every((failedFile) =>
          failedFileIds.includes(failedFile.fileId)
        )
      ) {
        ToastUtils.onFailure(
          `Some files could not be processed: ${failedItem.errorMessage}`
        );
      }
    });
  }

  return (
    job.failedItems
      ?.map((failedJob) =>
        failedJob.items.map((failedFile) => failedFile.fileId)
      )
      .flat()
      .filter((fileId) => !failedFileIds.includes(fileId)) || []
  );
};

export const VisionJobUpdate = createAsyncThunk<
  VisionAnnotation<VisionAnnotationDataType>[],
  {
    job: VisionJob;
    fileIds: number[];
    modelType: VisionDetectionModelType;
  },
  ThunkConfig
>(
  'VisionJobUpdate',
  async ({ job, fileIds, modelType }, { dispatch, getState }) => {
    let savedVisionAnnotation: VisionAnnotation<VisionAnnotationDataType>[] =
      [];

    const jobState = getState().processSlice.jobs;
    const existingJob = jobState.byId[job.jobId];

    if (job.status === 'Failed') {
      dispatch(
        fileProcessUpdate({
          modelType,
          fileIds,
          job,
          completedFileIds: [],
          failedFileIds: job.failedItems
            .map((item) => item.items.map(({ fileId }) => fileId))
            .flat(),
        })
      );
    }
    if (
      (existingJob && job.status === 'Running') ||
      job.status === 'Completed'
    ) {
      const { completedFileIds = [], failedFileIds = [] } = existingJob;

      // show error notification for new failed items and get corresponding file ids
      const newFailedFileIds = getNewFailedFileIds({ job, failedFileIds });

      // filter out previously completed files
      const newVisionJobResults =
        job.items?.filter((item) => !completedFileIds.includes(item.fileId)) ||
        [];

      // save new prediction results as annotations
      const unsavedAnnotations: UnsavedVisionAnnotation<VisionAnnotationDataType>[] =
        convertVisionJobResultsToUnsavedVisionAnnotations(
          newVisionJobResults,
          job.type
        );

      if (unsavedAnnotations.length) {
        const savedAnnotationResponse = await dispatch(
          SaveAnnotations(unsavedAnnotations)
        );
        savedVisionAnnotation = unwrapResult(savedAnnotationResponse);
      }

      dispatch(
        fileProcessUpdate({
          modelType,
          fileIds,
          job,
          completedFileIds: [
            ...completedFileIds,
            ...newVisionJobResults.map((item) => item.fileId),
          ],
          failedFileIds: [...failedFileIds, ...newFailedFileIds],
        })
      );

      if (newVisionJobResults.length) {
        await dispatch(
          RetrieveAnnotations({
            fileIds: newVisionJobResults.map((item) => item.fileId),
            clearCache: false,
          })
        );
      }
    }
    return savedVisionAnnotation;
  }
);
