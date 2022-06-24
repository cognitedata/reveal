import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { DeleteAnnotations } from 'src/store/thunks/Annotation/DeleteAnnotations';
import { ToastUtils } from 'src/utils/ToastUtils';
import { filterAssetIdsLinkedToGivenFile } from 'src/api/utils/filterAssetIdsLinkedToGivenFile';
import { removeAssetIdsFromFile } from 'src/store/util/removeAssetIdsFromFile';
import { InternalId } from '@cognite/sdk';
import { Status } from 'src/api/annotation/types';
import { isImageAssetLinkData } from 'src/modules/Common/types/typeGuards';

/**
 * Deletes annotations, if assetRef annotations are also available remove asset links from files with user consent
 *
 * ## Example
 * ```typescript
 *   dispatch(
 *     DeleteAnnotationsAndHandleLinkedAssetsOfFile({
 *       annotationIds: [{ id: 1 }],
 *       showWarnings: true,
 *     })
 *   );
 * ```
 */
export const DeleteAnnotationsAndHandleLinkedAssetsOfFile = createAsyncThunk<
  void,
  {
    annotationId: InternalId;
    showWarnings: boolean;
  },
  ThunkConfig
>(
  'DeleteAnnotationsAndRemoveLinkedAssets',
  async ({ annotationId, showWarnings }, { getState, dispatch }) => {
    const annotation =
      getState().annotationReducer.annotations.byId[annotationId.id];
    const verifiedAssetRefAnnotation =
      isImageAssetLinkData(annotation) && annotation.status === Status.Approved
        ? annotation
        : undefined;
    const annotationIsSaved = !!annotation.lastUpdatedTime;

    if (annotationIsSaved) {
      dispatch(DeleteAnnotations([annotationId]));
    }

    if (verifiedAssetRefAnnotation) {
      const fileId = verifiedAssetRefAnnotation.annotatedResourceId;
      const assetIdsLinkedToFile = await filterAssetIdsLinkedToGivenFile(
        [verifiedAssetRefAnnotation.id],
        fileId
      );

      if (assetIdsLinkedToFile.length) {
        if (showWarnings) {
          ToastUtils.onWarn(
            'Rejecting detected asset tag',
            'Do you want to remove the link between the file and the asset as well?',
            async () => {
              await removeAssetIdsFromFile(
                fileId,
                assetIdsLinkedToFile,
                dispatch
              );
            },
            'Remove asset link'
          );
        } else {
          await removeAssetIdsFromFile(fileId, assetIdsLinkedToFile, dispatch);
        }
      }
    }
  }
);
