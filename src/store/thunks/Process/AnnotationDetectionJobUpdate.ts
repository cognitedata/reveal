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

export const AnnotationDetectionJobUpdate = createAsyncThunk<
  VisionAnnotation[],
  { job: AnnotationJob; completedFileIds: number[] },
  ThunkConfig
>(
  'AnnotationDetectionJobUpdate',
  async ({ job, completedFileIds }, { dispatch }) => {
    if (job.status === 'Running' || job.status === 'Completed') {
      let unsavedAnnotations: UnsavedAnnotation[] = [];
      let assetExternalIdMap = new Map<string, VisionAsset>();

      // filter out previously completed files
      const newAnnotationJobResults =
        job.items?.filter((item) => !completedFileIds.includes(item.fileId)) ||
        [];

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
            }
          );
          const assetResponses = await Promise.all(assetRequests);
          const assetUnwrappedResponses = assetResponses.map((assetRes) =>
            unwrapResult(assetRes)
          );
          const assetMapArr = assetUnwrappedResponses.map(
            (assetUnwrappedResponse) =>
              new Map(
                assetUnwrappedResponse.map((asset) => [
                  asset.externalId!,
                  asset,
                ])
              )
          );
          assetExternalIdMap = assetMapArr.reduce((acc, current) => {
            return new Map([...acc, ...current]);
          });
        }
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
