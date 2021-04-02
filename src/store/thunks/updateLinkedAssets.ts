import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationStatus, AnnotationUtils } from 'src/utils/AnnotationUtils';
import { DetectionModelType } from 'src/api/types';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import {
  addAnnotations,
  deleteAnnotationsFromState,
} from 'src/store/commonActions';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import { DeleteAnnotations } from 'src/store/thunks/DeleteAnnotations';

export const updateLinkedAssets = createAsyncThunk<
  void,
  { fileId: string; assetIds: number[] | undefined },
  ThunkConfig
>('updateLinkedAssets', async (payload, { getState, dispatch }) => {
  if (payload.assetIds && payload.assetIds.length) {
    const assetInternalIds = payload.assetIds?.map((id) => ({ id }));

    const assetResponse = await dispatch(fetchAssets(assetInternalIds));
    const assets = unwrapResult(assetResponse);

    if (assets && assets.length) {
      const { fileId } = payload;

      // delete any linked annotations

      const modelId = AnnotationUtils.getModelId(
        String(fileId),
        DetectionModelType.Tag
      );
      const model = getState().previewSlice.models.byId[modelId];

      if (model) {
        const modelAnnotations = model.annotations.map(
          (id) => getState().previewSlice.annotations.byId[id]
        );
        const linkedAnnotations = modelAnnotations.filter(
          (ann) => ann.status === AnnotationStatus.Verified
        );

        const savedAnnotationIds = linkedAnnotations
          .filter((ann) => !!ann.lastUpdatedTime)
          .map((ann) => parseInt(ann.id, 10));

        if (savedAnnotationIds && savedAnnotationIds.length) {
          dispatch(DeleteAnnotations(savedAnnotationIds));
        }

        dispatch(
          deleteAnnotationsFromState(linkedAnnotations.map((ann) => ann.id!))
        );
      }

      // update annotations
      const assetIds = assets.map((a) => a.id);
      const annotationResponse = await dispatch(
        RetrieveAnnotations({
          fileId: parseInt(fileId, 10),
          assetIds,
        })
      );
      const retrievedAnnotations = unwrapResult(annotationResponse);
      const assetIdsOfRetrievedAnnotations = new Set(
        retrievedAnnotations.map((ann) => ann.linkedResourceId)
      );
      const assetsWithoutAnnotations = assets.filter(
        (asset) => !assetIdsOfRetrievedAnnotations.has(asset.id)
      );

      const linkedAssetVirtualAnnotations = assetsWithoutAnnotations.map(
        (asset) =>
          AnnotationUtils.createAnnotationFromAsset(asset, fileId.toString())
      );

      const annotations = AnnotationUtils.convertToVisionAnnotations(
        linkedAssetVirtualAnnotations.concat(retrievedAnnotations),
        DetectionModelType.Tag,
        fileId
      );

      dispatch(
        addAnnotations({
          fileId,
          annotations,
          type: DetectionModelType.Tag,
          status: AnnotationStatus.Verified,
        })
      );
    }
  }
});
