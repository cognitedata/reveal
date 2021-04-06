import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationStatus, AnnotationUtils } from 'src/utils/AnnotationUtils';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import { DetectionModelType } from 'src/api/types';
import { addAnnotations } from 'src/store/commonActions';
import { resetEditState } from '../previewSlice';

export const AddAnnotationsFromEditModeAssetIds = createAsyncThunk<
  void,
  string,
  ThunkConfig
>(
  'AddAnnotationsFromEditModeAssetIds',
  async (fileId, { getState, dispatch }) => {
    const editState = getState().previewSlice.drawer;

    const assetInternalIds = editState.selectedAssetIds?.map((id) => ({ id }));

    const assetResponse = await dispatch(fetchAssets(assetInternalIds));
    const assets = unwrapResult(assetResponse);

    if (assets && assets.length) {
      // update annotations

      const boundingBox = editState.annotation?.box;

      // add annotations without bounding box as virtual annotations
      const assetVisionAnnotations = assets.map((asset) =>
        AnnotationUtils.createVisionAnnotationStub(
          asset.name,
          DetectionModelType.Tag,
          parseInt(fileId, 10),
          boundingBox,
          undefined,
          'user',
          AnnotationStatus.Verified,
          undefined,
          'vision/tagdetection',
          undefined,
          asset.id,
          asset.externalId,
          boundingBox
            ? undefined
            : AnnotationUtils.generateAnnotationId(
                fileId,
                'vision/tagdetection',
                asset.id
              ),
          undefined,
          undefined,
          !boundingBox
        )
      );
      // const annotations = assetVisionAnnotations.map((item) =>
      //   AnnotationUtils.convertToAnnotation(item)
      // );
      // dispatch(SaveAnnotations(annotations));
      dispatch(addAnnotations(assetVisionAnnotations));

      dispatch(
        UpdateFiles([
          {
            id: Number(fileId),
            update: {
              assetIds: {
                add: editState.selectedAssetIds,
              },
            },
          },
        ])
      );
      dispatch(resetEditState());
    }
  }
);
