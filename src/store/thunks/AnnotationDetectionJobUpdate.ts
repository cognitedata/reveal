import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationJob, VisionAPIType } from 'src/api/types';
import { SaveAnnotations } from 'src/store/thunks/SaveAnnotations';
import { enforceRegionValidity, getUnsavedAnnotation } from 'src/api/utils';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import {
  AnnotationStatus,
  AnnotationUtils,
  VisionAnnotation,
} from 'src/utils/AnnotationUtils';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { VisionAsset } from 'src/modules/Common/filesSlice';

export const AnnotationDetectionJobUpdate = createAsyncThunk<
  VisionAnnotation[],
  AnnotationJob,
  ThunkConfig
>('AnnotationDetectionJobUpdate', async (job: AnnotationJob, { dispatch }) => {
  if (job.status === 'Completed') {
    let unsavedAnnotations: UnsavedAnnotation[] = [];
    let assetExternalIdMap = new Map<string, VisionAsset>();

    // fetch assets
    if (job.type === VisionAPIType.TagDetection && job.items.length) {
      const jobFilesWithDetectedAnnotations = job.items.filter(
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

    job.items.forEach((annResult) => {
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
});
