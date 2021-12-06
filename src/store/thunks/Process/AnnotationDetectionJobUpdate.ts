import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { VisionAsset } from 'src/modules/Common/store/filesSlice';
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
      let assetExternalIdMap = new Map<string, VisionAsset>();

      const newCompletedFileIds =
        job.items
          ?.map((item) => item.fileId)
          .filter((item) => !completedFileIds.includes(item)) || [];

      const newFailedFileIds: number[] =
        job.failedItems
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
        const assetRequests = jobFilesWithDetectedAnnotations.map((jobItem) => {
          const assetExternalIds = [
            ...new Set(
              jobItem.annotations.map(
                (detectedAnnotation) => detectedAnnotation.text
              )
            ),
          ];
          return dispatch(
            fetchAssets(
              assetExternalIds.map((externalId) => ({
                externalId,
              }))
            )
          );
        });
        const assetResponses = await Promise.all(assetRequests);
        const assetUnwrappedResponses = assetResponses.map((assetRes) =>
          unwrapResult(assetRes)
        );
        const assetMapArr = assetUnwrappedResponses.map(
          (assetUnwrappedResponse) =>
            new Map(
              assetUnwrappedResponse.map((asset) => [asset.externalId!, asset])
            )
        );
        assetExternalIdMap = assetMapArr.reduce((acc, current) => {
          return new Map([...acc, ...current]);
        });
      }

      // save new prediction results as annotations
      newAnnotationJobResults.forEach((annResult) => {
        const { annotations } = annResult;

        if (annotations && annotations.length) {
          const unsavedAnnotationsForFile = annotations.map((ann) => {
            const asset = assetExternalIdMap.get(ann.text);

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
