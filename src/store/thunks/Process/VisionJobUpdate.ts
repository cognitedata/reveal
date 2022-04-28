import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { VisionAsset } from 'src/modules/Common/store/files/types';
import { ThunkConfig } from 'src/store/rootReducer';
import {
  VisionJob,
  VisionDetectionModelType,
  TagDetectionJobAnnotation,
} from 'src/api/vision/detectionModels/types';

import { UnsavedAnnotation } from 'src/api/annotation/types';
import { SaveAnnotations } from 'src/store/thunks/Annotation/SaveAnnotations';
import {
  AnnotationStatus,
  AnnotationUtils,
  ModelTypeAnnotationTypeMap,
  VisionAnnotationV1,
} from 'src/utils/AnnotationUtils';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { fileProcessUpdate } from 'src/store/commonActions';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { ToastUtils } from 'src/utils/ToastUtils';
import { convertVisionJobAnnotationToAnnotationTypeV1 } from 'src/api/vision/detectionModels/converters';

export const VisionJobUpdate = createAsyncThunk<
  VisionAnnotationV1[],
  {
    job: VisionJob;
    fileIds: number[];
    modelType: VisionDetectionModelType;
  },
  ThunkConfig
>(
  'VisionJobUpdate',
  async ({ job, fileIds, modelType }, { dispatch, getState }) => {
    let savedVisionAnnotation: VisionAnnotationV1[] = [];

    const jobState = getState().processSlice.jobs;

    const existingJob = jobState.byId[job.jobId];

    if (
      (existingJob && job.status === 'Running') ||
      job.status === 'Completed'
    ) {
      const { completedFileIds = [], failedFileIds = [] } = existingJob;
      let assetIdMap = new Map<number, VisionAsset>();

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

      const newFailedFileIds: number[] =
        job.failedItems
          ?.map((failedJob) =>
            failedJob.items.map((failedFile) => failedFile.fileId)
          )
          .flat() // flatten the array
          .filter((fileId) => !failedFileIds.includes(fileId)) || [];

      // filter out previously completed files
      const newVisionJobResults =
        job.items?.filter((item) => !completedFileIds.includes(item.fileId)) ||
        [];

      // fetch assets if tag detection
      if (
        job.type === VisionDetectionModelType.TagDetection &&
        newVisionJobResults.length
      ) {
        const jobFilesWithDetectedAnnotations = newVisionJobResults.filter(
          (jobItem) => !!jobItem.annotations.length
        );
        if (jobFilesWithDetectedAnnotations.length) {
          const assetRequests = jobFilesWithDetectedAnnotations.map(
            (jobItem) => {
              const assetIds: number[] = [
                ...new Set(
                  jobItem.annotations
                    .map(
                      (detectedAnnotation) =>
                        (detectedAnnotation as TagDetectionJobAnnotation)
                          ?.assetIds
                    )
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

      let unsavedAnnotations: UnsavedAnnotation[] = [];

      // save new prediction results as annotations
      newVisionJobResults.forEach((results) => {
        const { annotations: jobAnnotations } = results;

        if (jobAnnotations && jobAnnotations.length) {
          const unsavedAnnotationsForFile = jobAnnotations
            .map((item): UnsavedAnnotation | UnsavedAnnotation[] => {
              const convertedAnnotations =
                convertVisionJobAnnotationToAnnotationTypeV1(item, job.type);

              if (!convertedAnnotations) {
                return {} as UnsavedAnnotation;
              }
              if ((convertedAnnotations as UnsavedAnnotation[]).length) {
                const annotations = convertedAnnotations as UnsavedAnnotation[];
                return annotations.map((imageAssetLink, index) => {
                  const asset = assetIdMap.get(
                    (item as TagDetectionJobAnnotation).assetIds[index]
                  );
                  return {
                    ...imageAssetLink,
                    annotationType: ModelTypeAnnotationTypeMap[job.type],
                    annotatedResourceId: results.fileId,
                    annotatedResourceType: 'file',
                    source: 'context_api',
                    status: AnnotationStatus.Unhandled,
                    linkedResourceId: asset?.id,
                    linkedResourceExternalId: asset?.externalId,
                  };
                });
              }

              const annotation = convertedAnnotations as UnsavedAnnotation;

              return {
                ...annotation,
                annotationType: ModelTypeAnnotationTypeMap[job.type],
                annotatedResourceId: results.fileId,
                annotatedResourceType: 'file',
                source: 'context_api',
                status: AnnotationStatus.Unhandled,
              };
            })
            .filter((item): item is UnsavedAnnotation[] => !!item)
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
        const savedAnnotations = unwrapResult(savedAnnotationResponse);
        savedVisionAnnotation =
          AnnotationUtils.convertToVisionAnnotationsV1(savedAnnotations);
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
