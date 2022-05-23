import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { DeleteAnnotationsV1 } from 'src/store/thunks/Annotation/DeleteAnnotationsV1';
import { AnnotationStatus } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { ToastUtils } from 'src/utils/ToastUtils';
import { filterAssetIdsLinkedToGivenFile } from 'src/api/utils/filterAssetIdsLinkedToGivenFile';
import { removeAssetIdsFromFile } from 'src/store/util/removeAssetIdsFromFile';
import { groupAnnotationsByFile } from 'src/api/utils/groupAnnotationsByFile';
import { isAssetLinkedAnnotation } from 'src/api/annotation/typeGuards';

/**
 * Deletes annotations, if assetRef annotations are also available remove asset links from files with user consent
 *
 * {
 *   annotationIds: annotationIds from annotationState,
 *   showWarnings: if true, user confirmation is required to update files
 * }
 */
export const DeleteAnnotationsAndHandleLinkedAssetsOfFile = createAsyncThunk<
  void,
  {
    annotationIds: number[];
    showWarnings: boolean;
  },
  ThunkConfig
>(
  'DeleteAnnotationsAndRemoveLinkedAssets',
  async ({ annotationIds, showWarnings }, { getState, dispatch }) => {
    const annotations = annotationIds.map(
      (id) => getState().annotationV1Reducer.annotations.byId[id]
    );
    const verifiedAssetRefAnnotations = annotations.filter(
      (ann) =>
        isAssetLinkedAnnotation(ann) && ann.status === AnnotationStatus.Verified
    );

    const savedAnnotationIds = annotations
      .filter((ann) => !!ann.lastUpdatedTime)
      .map((ann) => ann.id);

    if (savedAnnotationIds && savedAnnotationIds.length) {
      dispatch(DeleteAnnotationsV1(savedAnnotationIds));
    }

    if (verifiedAssetRefAnnotations.length) {
      // group assetRefAnnotations by file id
      const fileAnnotationMap = groupAnnotationsByFile(
        verifiedAssetRefAnnotations
      );

      // remove linked assets for each file
      await Promise.all(
        Array.from(fileAnnotationMap).map(
          async ([fileId, fileAssetRefAnnotations]) => {
            const assetIdsLinkedToFile = await filterAssetIdsLinkedToGivenFile(
              fileAssetRefAnnotations.map((ann) => ann.linkedResourceId!),
              fileId
            );

            if (assetIdsLinkedToFile.length) {
              if (showWarnings) {
                ToastUtils.onWarn(
                  'Rejecting detected asset tag',
                  'Do you want to remove the link between the file and the asset as well?',
                  () => {
                    removeAssetIdsFromFile(
                      fileId,
                      assetIdsLinkedToFile,
                      dispatch
                    );
                  },
                  'Remove asset link'
                );
              } else {
                await removeAssetIdsFromFile(
                  fileId,
                  assetIdsLinkedToFile,
                  dispatch
                );
              }
            }
          }
        )
      );
    }
  }
);
