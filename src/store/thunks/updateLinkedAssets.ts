import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationStatus, AnnotationUtils } from 'src/utils/AnnotationUtils';
import { DetectionModelType } from 'src/api/types';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { addAnnotations, deleteAnnotations } from 'src/store/commonActions';

export const updateLinkedAssets = createAsyncThunk<
  void,
  { fileId: string; assetIds: number[] | undefined },
  ThunkConfig
>('updateLinkedAssets', async (payload, { getState, dispatch }) => {
  if (payload.assetIds && payload.assetIds.length) {
    const assetInternalIds = payload.assetIds?.map((id) => ({ id }));

    dispatch(fetchAssets(assetInternalIds))
      .then(unwrapResult)
      .then((assets) => {
        if (assets && assets.length) {
          const { fileId } = payload;

          // delete any linked annotations

          const modelId = AnnotationUtils.getModelId(
            String(fileId),
            DetectionModelType.Tag
          );
          const model = getState().previewSlice.models.byId[modelId];

          if (model) {
            const linkedAnnotations = model.annotations.filter(
              (annId) =>
                getState().previewSlice.annotations.byId[annId].status ===
                AnnotationStatus.Verified
            );

            dispatch(deleteAnnotations(linkedAnnotations));
          }

          // update annotations

          const annotations = AnnotationUtils.convertToAnnotations(
            assets.map((asset) => ({
              description: asset.externalId || '',
              confidence: 1,
              attributes: null,
              linkedAssetId: asset.id,
              linkedAssetExternalId: asset.externalId,
            })),
            DetectionModelType.Tag
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
      });
  }
});
