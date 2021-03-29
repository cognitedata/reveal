import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { DetectionModelType } from 'src/api/types';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';

export const LinkFileAssetsByAnnotationId = createAsyncThunk<
  void,
  string,
  ThunkConfig
>(
  'LinkFileAssetsByAnnotationId',
  async (annotationId, { getState, dispatch }) => {
    const updateFile = (fileId: string, assetExternalId: string) => {
      dispatch(fetchAssets([{ externalId: assetExternalId }]))
        .then(unwrapResult)
        .then((assets) => {
          const ids = assets.map((asset) => asset.id);

          dispatch(
            UpdateFiles([
              {
                id: Number(fileId),
                update: {
                  assetIds: {
                    add: ids,
                  },
                },
              },
            ])
          );
        });
    };

    const annotation = getState().previewSlice.annotations.byId[annotationId];

    if (annotation && annotation.status === AnnotationStatus.Verified) {
      const model = getState().previewSlice.models.byId[annotation.modelId];

      if (model.modelType === DetectionModelType.Tag) {
        const { fileId } = model;
        updateFile(fileId, annotation.description);
      }
    }
  }
);
