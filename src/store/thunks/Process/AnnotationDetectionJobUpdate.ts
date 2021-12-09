import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { VisionAsset } from 'src/modules/Common/store/files/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationJob, VisionAPIType } from 'src/api/types';
import {
  enforceRegionValidity,
  getUnsavedAnnotation,
} from 'src/api/annotation/utils';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import { SaveAnnotations } from 'src/store/thunks/Annotation/SaveAnnotations';
import {
  AnnotationStatus,
  AnnotationUtils,
  VisionAnnotation,
} from 'src/utils/AnnotationUtils';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { fileProcessUpdate } from 'src/store/commonActions';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';

export const AnnotationDetectionJobUpdate = createAsyncThunk<
  VisionAnnotation[],
  {
    job: AnnotationJob;
    fileIds: number[];
    modelType: VisionAPIType;
    completedFileIds: number[];
    failedFileIds: number[];
  },
  ThunkConfig
>(
  'AnnotationDetectionJobUpdate',
  async (
    { job, fileIds, modelType, completedFileIds, failedFileIds },
    { dispatch }
  ) => {
    if (job.status === 'Running' || job.status === 'Completed') {
      let unsavedAnnotations: UnsavedAnnotation[] = [];
      let assetIdMap = new Map<number, VisionAsset>();

      const newCompletedFileIds =
        job.items
          ?.map((item) => item.fileId)
          .filter((item) => !completedFileIds.includes(item)) || [];

      const newFailedFileIds: number[] =
        job.failedItems
          // Use first item in batch to check if the batch has failed
          ?.map((failedJob) => failedJob.items[0].fileId)
          .filter((fileId) => !failedFileIds.includes(fileId)) || [];

      // filter out previously completed files
      const newAnnotationJobResults =
        job.items?.filter((item) =>
          newCompletedFileIds.includes(item.fileId)
        ) || [];

      // fetch assets if tag detection
      if (
        job.type === VisionAPIType.TagDetection &&
        newAnnotationJobResults.length
      ) {
        const jobFilesWithDetectedAnnotations = newAnnotationJobResults.filter(
          (jobItem) => !!jobItem.annotations.length
        );
        if (jobFilesWithDetectedAnnotations.length) {
          const assetRequests = jobFilesWithDetectedAnnotations.map(
            (jobItem) => {
              const assetIds: number[] = [
                ...new Set(
                  jobItem.annotations
                    .map((detectedAnnotation) => detectedAnnotation?.assetIds)
                    .filter((item): item is number[] => !!item)
                    .flat()
                ),
              ];

              return dispatch(
                fetchAssets(
                  assetIds.map((id) => ({
                    id,
                  }))
                )
              );
            }
          );
          const assetResponses = await Promise.all(assetRequests);
          const assetUnwrappedResponses = assetResponses.map((assetRes) =>
            unwrapResult(assetRes)
          );
          const assetMapArr = assetUnwrappedResponses.map(
            (assetUnwrappedResponse) =>
              new Map(assetUnwrappedResponse.map((asset) => [asset.id, asset]))
          );
          assetIdMap = assetMapArr.reduce((acc, current) => {
            return new Map([...acc, ...current]);
          });
        }
      }

      // save new prediction results as annotations
      newAnnotationJobResults.forEach((annResult) => {
        const { annotations } = annResult;

        if (annotations && annotations.length) {
          const unsavedAnnotationsForFile = annotations
            .map((ann) => {
              if (ann.assetIds && ann.assetIds.length) {
                return ann.assetIds.map((assetId) => {
                  const asset = assetIdMap.get(assetId);
                  return getUnsavedAnnotation(
                    ann.text,
                    job.type,
                    annResult.fileId,
                    'context_api',
                    enforceRegionValidity(ann.region),
                    AnnotationStatus.Unhandled,
                    { confidence: ann.confidence },
                    asset?.id,
                    asset?.externalId
                  );
                });
              }
              return getUnsavedAnnotation(
                ann.text,
                job.type,
                annResult.fileId,
                'context_api',
                enforceRegionValidity(ann.region),
                AnnotationStatus.Unhandled,
                { confidence: ann.confidence }
              );
            })
            .filter((item): item is UnsavedAnnotation[] => !!item)
            .flat();
          unsavedAnnotations = unsavedAnnotations.concat(
            unsavedAnnotationsForFile
          );
        }
      });

      dispatch(
        fileProcessUpdate({
          modelType,
          fileIds,
          job,
          completedFileIds: [...completedFileIds, ...newCompletedFileIds],
          failedFileIds: [...failedFileIds, ...newFailedFileIds],
        })
      );

      if (newCompletedFileIds.length) {
        await dispatch(
          RetrieveAnnotations({
            fileIds: newCompletedFileIds,
            clearCache: false,
          })
        );
      }

      if (unsavedAnnotations.length) {
        const savedAnnotationResponse = await dispatch(
          SaveAnnotations(unsavedAnnotations)
        );
        const savedAnnotations = unwrapResult(savedAnnotationResponse);
        return AnnotationUtils.convertToVisionAnnotations(savedAnnotations);
      }
    }
    return [];
  }
);
