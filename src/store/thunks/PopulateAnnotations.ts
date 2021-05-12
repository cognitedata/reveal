import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import {
  AnnotationStatus,
  AnnotationUtils,
  VisionAnnotation,
} from 'src/utils/AnnotationUtils';
import { LinkedAnnotation, VisionAPIType } from 'src/api/types';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { addAnnotations } from 'src/store/commonActions';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import { VisionAnnotationState } from 'src/modules/Preview/previewSlice';

export const PopulateAnnotations = createAsyncThunk<
  void,
  { fileId: string; assetIds: number[] | undefined },
  ThunkConfig
>('PopulateAnnotations', async (payload, { getState, dispatch }) => {
  const { fileId } = payload;
  const annotationState = getState().previewSlice;

  const annotationResponse = await dispatch(
    RetrieveAnnotations({
      fileId: parseInt(fileId, 10),
      assetIds: undefined,
    })
  );
  const retrievedAnnotations = unwrapResult(annotationResponse);
  let linkedAssetVirtualAnnotations: VisionAnnotation[] = [];

  if (payload.assetIds && payload.assetIds.length) {
    const assetInternalIds = payload.assetIds.map((id) => ({ id }));

    const assetResponse = await dispatch(fetchAssets(assetInternalIds));
    const assets = unwrapResult(assetResponse);

    if (assets && assets.length) {
      // // delete asset linked virtual annotations
      //
      // const assetLinkedVirtualAnnotations = getAvailableAnnotationsForModelType(
      //   annotationState,
      //   String(fileId),
      //   DetectionModelType.Tag
      // ).filter((item) => item.virtual);
      // if (
      //   assetLinkedVirtualAnnotations &&
      //   assetLinkedVirtualAnnotations.length
      // ) {
      //   dispatch(
      //     deleteAnnotationsFromState(
      //       assetLinkedVirtualAnnotations.map((ann) => ann.id)
      //     )
      //   );
      // }

      // add new virtual annotations

      const availableTagAnnotations = getAvailableAnnotationsForModelType(
        annotationState,
        String(fileId),
        VisionAPIType.TagDetection
      );

      const assetIdsOfTagAnnotations = new Set(
        [...retrievedAnnotations, ...availableTagAnnotations]
          .filter((ann) => !!(ann as LinkedAnnotation).linkedResourceId)
          .map((ann) => (ann as LinkedAnnotation).linkedResourceId)
      );
      const assetsWithoutAnnotations = assets.filter(
        (asset) => !assetIdsOfTagAnnotations.has(asset.id)
      );

      linkedAssetVirtualAnnotations = assetsWithoutAnnotations.map((asset) =>
        AnnotationUtils.createVisionAnnotationStub(
          asset.id,
          asset.name,
          VisionAPIType.TagDetection,
          parseInt(fileId, 10),
          0,
          0,
          undefined,
          undefined,
          'vision/tagdetection',
          AnnotationStatus.Verified,
          undefined,
          'vision/tagdetection',
          undefined,
          asset.id,
          asset.externalId,
          true
        )
      );
    }
  }

  const retrievedVisionAnnotations = AnnotationUtils.convertToVisionAnnotations(
    retrievedAnnotations
  );
  const all = [...retrievedVisionAnnotations, ...linkedAssetVirtualAnnotations];

  dispatch(addAnnotations(all));
});

const getAvailableAnnotationsForModelType = (
  annotationState: any,
  fileId: string,
  modelType: VisionAPIType
) => {
  const modelId = AnnotationUtils.getModelId(fileId, modelType);
  const model = annotationState.models.byId[modelId];

  let annotations: VisionAnnotationState[] = [];

  if (model) {
    annotations = model.annotations.map(
      (id: string) => annotationState.annotations.byId[id]
    );
  }
  return annotations;
};
