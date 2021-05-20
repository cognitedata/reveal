import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationStatus, AnnotationUtils } from 'src/utils/AnnotationUtils';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import { VisionAPIType } from 'src/api/types';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import {
  addTagAnnotations,
  resetEditState,
} from 'src/modules/Preview/previewSlice';
import { getRegionFromBox, getUnsavedAnnotation } from 'src/api/utils';
import { SaveAnnotations } from 'src/store/thunks/SaveAnnotations';

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

    const state = getState().previewSlice;
    const editModeAnnotationData = state.drawer;

    if (assets && assets.length) {
      // update annotations

      // add annotations without bounding box as virtual annotations
      const assetAnnotations = assets.map((asset) =>
        getUnsavedAnnotation(
          asset.externalId || asset.name,
          VisionAPIType.TagDetection,
          file.id,
          getRegionFromBox('rectangle', editModeAnnotationData.box),
          AnnotationStatus.Verified,
          'user',
          asset.id,
          asset.externalId,
          file.externalId
        )
      );

      const savedAnnotationResponse = await dispatch(
        SaveAnnotations(assetAnnotations)
      );
      const savedAnnotations = unwrapResult(savedAnnotationResponse);

      const assetVisionAnnotations =
        AnnotationUtils.convertToVisionAnnotations(savedAnnotations);

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
