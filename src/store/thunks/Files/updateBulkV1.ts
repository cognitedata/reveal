import { Label } from '@cognite/sdk';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFileV1 } from 'src/store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFileV1';
import { VisionFile } from 'src/modules/Common/store/files/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationStatus } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { AnnotationStatusChangeV1 } from 'src/store/thunks/Annotation/AnnotationStatusChangeV1';
import { UpdateFiles } from './UpdateFiles';

export const getUpdatedValue = ({
  unsavedValue,
}: {
  unsavedValue?: string;
}) => {
  const removeValue: boolean = unsavedValue === '';
  const updatedValue: string | undefined = removeValue
    ? undefined
    : unsavedValue;

  if (removeValue) {
    return { setNull: true };
  }
  if (updatedValue) {
    return { set: updatedValue };
  }
  return undefined;
};

export const updateBulkV1 = createAsyncThunk<
  void,
  { selectedFiles: VisionFile[]; bulkEditUnsaved: BulkEditUnsavedState },
  ThunkConfig
>('updateBulkV1', async ({ selectedFiles, bulkEditUnsaved }, { dispatch }) => {
  const payload: {
    id: number;
    update: {};
  }[] = selectedFiles.map((file) => {
    /**
     * API limitations:
     * - All set/add/remove should be populated, no null allowed
     * - No overlap elements in add and remove operations allowed
     * - set and setNull are mutually exclusive
     */

    const { id } = file;
    const addedLabels: Label[] = bulkEditUnsaved.labels || [];

    const updatedMetadata = bulkEditUnsaved.metadata;
    const newMetadata = updatedMetadata
      ? Object.keys(updatedMetadata)
          .filter((key) => !!updatedMetadata[key])
          .reduce(
            (res, key) => Object.assign(res, { [key]: updatedMetadata[key] }),
            {}
          )
      : {};

    // No overlap elements in add and remove operations allowed
    // So remove will priorities
    const updatedAssets = bulkEditUnsaved.assetIds;
    const assetsToRemove = updatedAssets?.removedAssetIds || [];
    const assetsToAdd =
      updatedAssets?.addedAssetIds?.filter(
        (addedAssetIds) => !assetsToRemove?.includes(addedAssetIds)
      ) || [];

    return {
      id,
      update: {
        labels: { add: addedLabels },
        metadata: { add: newMetadata },
        assetIds: {
          add: assetsToAdd,
          remove: assetsToRemove,
        },
        source: getUpdatedValue({ unsavedValue: bulkEditUnsaved.source }),
        directory: getUpdatedValue({ unsavedValue: bulkEditUnsaved.directory }),
      },
    };
  });

  if (bulkEditUnsaved.annotationIds) {
    const updateAnnotationStatuses = async (
      status: AnnotationStatus,
      annotationIds?: number[]
    ) => {
      if (!annotationIds) return;
      await Promise.all(
        annotationIds.map((id) => {
          return dispatch(
            AnnotationStatusChangeV1({
              id,
              status,
            })
          );
        })
      );
    };
    const { annotationIds } = bulkEditUnsaved;
    // Update annotation statuses
    updateAnnotationStatuses(
      AnnotationStatus.Rejected,
      annotationIds.rejectedAnnotationIds
    );
    updateAnnotationStatuses(
      AnnotationStatus.Verified,
      annotationIds.verifiedAnnotationIds
    );
    updateAnnotationStatuses(
      AnnotationStatus.Unhandled,
      annotationIds.unhandledAnnotationIds
    );
    // Delete annotations
    await dispatch(
      DeleteAnnotationsAndHandleLinkedAssetsOfFileV1({
        annotationIds: annotationIds.annotationIdsToDelete || [],
        showWarnings: true,
      })
    );
  }
  await dispatch(UpdateFiles(payload));
});
