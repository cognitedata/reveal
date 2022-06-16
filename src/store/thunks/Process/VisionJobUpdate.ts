import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import {
  VisionJob,
  VisionDetectionModelType,
  VisionJobRunning,
  VisionJobCompleted,
} from 'src/api/vision/detectionModels/types';

import {
  CDFAnnotationTypeEnum,
  ImageAssetLink,
  Status,
} from 'src/api/annotation/types';
import { SaveAnnotations } from 'src/store/thunks/Annotation/SaveAnnotations';
import { fileProcessUpdate } from 'src/store/commonActions';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { ToastUtils } from 'src/utils/ToastUtils';
import { convertVisionJobAnnotationToVisionAnnotation } from 'src/api/vision/detectionModels/converters';
import {
  UnsavedVisionAnnotation,
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { isImageAssetLinkData } from 'src/modules/Common/types/typeGuards';
import { VisionModelTypeCDFAnnotationTypeMap } from 'src/utils/visionAnnotationUtils';

const isVisionAnnotationDataTypeList = (
  data: VisionAnnotationDataType | VisionAnnotationDataType[]
): data is VisionAnnotationDataType[] => {
  return (data as VisionAnnotationDataType[]).length !== undefined;
};

const isImageAssetLinkDataList = (
  data: VisionAnnotationDataType | VisionAnnotationDataType[]
): data is ImageAssetLink[] => {
  return (
    isVisionAnnotationDataTypeList(data) &&
    data.every((item) => isImageAssetLinkData(item))
  );
};

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
      let unsavedAnnotations: UnsavedVisionAnnotation<VisionAnnotationDataType>[] =
        [];
      newVisionJobResults.forEach((results) => {
        const { annotations: jobAnnotations } = results;

        if (jobAnnotations && jobAnnotations.length) {
          const unsavedAnnotationsForFile = jobAnnotations
            .map((item):
              | UnsavedVisionAnnotation<VisionAnnotationDataType>[]
              | UnsavedVisionAnnotation<VisionAnnotationDataType>
              | null => {
              const convertedAnnotations =
                convertVisionJobAnnotationToVisionAnnotation(item, job.type);

              if (!convertedAnnotations) {
                return null;
              }
              if (isImageAssetLinkDataList(convertedAnnotations)) {
                return convertedAnnotations.map((annotation) => {
                  return {
                    annotationType: CDFAnnotationTypeEnum.ImagesAssetLink,
                    annotatedResourceId: results.fileId,
                    status: Status.Suggested,
                    data: annotation,
                  };
                });
              }

              return {
                annotationType: VisionModelTypeCDFAnnotationTypeMap[job.type],
                annotatedResourceId: results.fileId,
                status: Status.Suggested,
                data: convertedAnnotations,
              };
            })
            .filter(
              (
                item
              ): item is UnsavedVisionAnnotation<VisionAnnotationDataType>[] =>
                !!item
            )
            .flat();
          unsavedAnnotations = unsavedAnnotations.concat(
            unsavedAnnotationsForFile
          );
        }
      });

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
