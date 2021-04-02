import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationUtils } from 'src/utils/AnnotationUtils';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import { SaveAnnotations } from 'src/store/thunks/SaveAnnotations';
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
      const annotations = assets.map((asset) =>
        AnnotationUtils.createAnnotationFromAsset(asset, fileId, boundingBox)
      );

      await Promise.all([
        dispatch(SaveAnnotations(annotations)),
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
        ),
      ]);
      dispatch(resetEditState());
    }
  }
);
