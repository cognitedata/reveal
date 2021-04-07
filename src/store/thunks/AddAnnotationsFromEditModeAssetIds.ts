import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationStatus, AnnotationUtils } from 'src/utils/AnnotationUtils';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import { DetectionModelType } from 'src/api/types';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { addTagAnnotations, resetEditState } from '../previewSlice';

export const AddAnnotationsFromEditModeAssetIds = createAsyncThunk<
  void,
  FileInfo,
  ThunkConfig
>(
  'AddAnnotationsFromEditModeAssetIds',
  async (file, { getState, dispatch }) => {
    const annotationState = getState().previewSlice;
    const editState = annotationState.drawer;

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
          file.id,
          boundingBox,
          undefined,
          'user',
          AnnotationStatus.Verified,
          undefined,
          'vision/tagdetection',
          file.externalId,
          asset.id,
          asset.externalId,
          undefined,
          undefined,
          undefined,
          false
        )
      );
      dispatch(addTagAnnotations(assetVisionAnnotations));

      dispatch(
        UpdateFiles([
          {
            id: Number(file.id),
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
