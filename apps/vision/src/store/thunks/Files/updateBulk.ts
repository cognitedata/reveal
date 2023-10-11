import { createAsyncThunk } from '@reduxjs/toolkit';

import { Label } from '@cognite/sdk';

import { Status } from '../../../api/annotation/types';
import { BulkEditUnsavedState } from '../../../modules/Common/store/common/types';
import { VisionFile } from '../../../modules/Common/store/files/types';
import { ThunkConfig } from '../../rootReducer';
import { DeleteAnnotations } from '../Annotation/DeleteAnnotations';
import { UpdateAnnotations } from '../Annotation/UpdateAnnotations';

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

/**
 * ## Example
 * ```typescript
 *  dispatch(
 *    updateBulk({
 *      selectedFiles: [
 *        {
 *          id: 1,
 *          ...
 *        },
 *      ],
 *      bulkEditUnsaved: {
 *        directory: '/tmp',
 *        metadata: {
 *          key: 'value',
 *        },
 *      },
 *    })
 *  )
 * ```
 */

/**
 * Either update files or updateStatus/delete annotation will be called depending on the bulkEditUnsaved.
 * All the unsaved states for other bulk edits will be cleared by the bulk edit switching logic
 */
export const updateBulk = createAsyncThunk<
  void,
  { selectedFiles: VisionFile[]; bulkEditUnsaved: BulkEditUnsavedState },
  ThunkConfig
>('updateBulk', async ({ selectedFiles, bulkEditUnsaved }, { dispatch }) => {
  if (bulkEditUnsaved.annotationIds) {
    const updateAnnotationStatuses = async (
      status: Status,
      annotationIds?: number[]
    ) => {
      if (!annotationIds) return;
      await dispatch(
        UpdateAnnotations(
          annotationIds.map((id) => ({
            id,
            update: { status: { set: status } },
          }))
        )
      );
    };
    const { annotationIds } = bulkEditUnsaved;
    // Update annotation statuses
    updateAnnotationStatuses(
      Status.Rejected,
      annotationIds.rejectedAnnotationIds
    );
    updateAnnotationStatuses(
      Status.Approved,
      annotationIds.verifiedAnnotationIds
    );
    updateAnnotationStatuses(
      Status.Suggested,
      annotationIds.unhandledAnnotationIds
    );
    // Delete annotations
    await dispatch(
      DeleteAnnotations(
        annotationIds.annotationIdsToDelete?.map((id) => ({ id })) || []
      )
    );
  } else {
    const payload: {
      id: number;
      update: object;
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
          directory: getUpdatedValue({
            unsavedValue: bulkEditUnsaved.directory,
          }),
        },
      };
    });

    await dispatch(UpdateFiles(payload));
  }
});
