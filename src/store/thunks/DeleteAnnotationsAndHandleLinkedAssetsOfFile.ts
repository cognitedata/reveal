import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import { DeleteAnnotations } from 'src/store/thunks/DeleteAnnotations';
import { deleteAnnotationsFromState } from 'src/store/commonActions';
import { VisionAnnotationState } from 'src/modules/Review/previewSlice';
import { ToastUtils } from 'src/utils/ToastUtils';
import { fetchAssets } from 'src/store/thunks/fetchAssets';

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
      (id) => getState().previewSlice.annotations.byId[id]
    );
    const linkedAnnotations: VisionAnnotationState[] = [];

    annotations.forEach((annotation) => {
      if (
        annotation &&
        annotation.status === AnnotationStatus.Verified &&
        (annotation.linkedResourceId || annotation.linkedResourceExternalId)
      ) {
        linkedAnnotations.push(annotation);
      }
    });

    const savedAnnotationIds = annotations
      .filter((ann) => !!ann.lastUpdatedTime)
      .map((ann) => ann.id);

    if (savedAnnotationIds && savedAnnotationIds.length) {
      dispatch(DeleteAnnotations(savedAnnotationIds));
    }

    dispatch(deleteAnnotationsFromState(annotations.map((ann) => ann.id!)));

    const removeAssetIdsFromFile = async (
      fileId: number,
      assetExternalIds: string[]
    ) => {
      const assetResponse = await dispatch(
        fetchAssets(assetExternalIds.map((externalId) => ({ externalId })))
      );
      const assets = unwrapResult(assetResponse);

      dispatch(
        UpdateFiles([
          {
            id: fileId,
            update: {
              assetIds: {
                remove: assets.map((asset) => asset.id),
              },
            },
          },
        ])
      );
    };

    if (linkedAnnotations.length && showWarnings) {
      const model =
        getState().previewSlice.models.byId[linkedAnnotations[0].modelId];
      const { fileId } = model;
      const assetExternalIds = linkedAnnotations.map(
        (ann) => ann.linkedResourceExternalId!
      );
      ToastUtils.onWarn(
        'Rejecting detected asset tag',
        'Do you want to remove the link between the file and the asset as well?',
        () => {
          removeAssetIdsFromFile(fileId, assetExternalIds);
        },
        'Remove asset link'
      );
    }
  }
);
