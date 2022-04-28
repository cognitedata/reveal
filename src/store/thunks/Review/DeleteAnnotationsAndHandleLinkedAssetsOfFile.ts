import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { DeleteAnnotations } from 'src/store/thunks/Annotation/DeleteAnnotations';
import { UpdateFiles } from 'src/store/thunks/Files/UpdateFiles';
import {
  AnnotationStatus,
  VisionAnnotationV1,
} from 'src/utils/AnnotationUtils';
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
      (id) => getState().annotationV1Reducer.annotations.byId[id]
    );
    const linkedAnnotations: VisionAnnotationV1[] = [];

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
      const fileId = linkedAnnotations[0].annotatedResourceId;
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
