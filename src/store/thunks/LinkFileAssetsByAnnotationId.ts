import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { AnnotationStatus, AnnotationUtils } from 'src/utils/AnnotationUtils';
import { DetectionModelType } from 'src/api/types';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import { SaveAnnotations } from 'src/store/thunks/SaveAnnotations';
import { VisionAnnotationState } from 'src/store/previewSlice';

export const LinkFileAssetsByAnnotationId = createAsyncThunk<
  void,
  string,
  ThunkConfig
>(
  'LinkFileAssetsByAnnotationId',
  async (annotationId, { getState, dispatch }) => {
    const updateFileAndSaveAnnotation = async (
      fileId: string,
      assetExternalId: string,
      annotation: VisionAnnotationState
    ) => {
      const assetResponse = await dispatch(
        fetchAssets([{ externalId: assetExternalId }])
      );
      const assets = unwrapResult(assetResponse);

      if (assets && assets.length) {
        const asset = assets[0];

        const unsavedAnnotation = AnnotationUtils.convertToAnnotation({
          ...annotation,
          linkedResourceId: asset.id,
          linkedResourceExternalId: asset.externalId,
          linkedResourceType: 'asset',
        });

        await Promise.all([
          dispatch(SaveAnnotations([unsavedAnnotation])),
          dispatch(
            UpdateFiles([
              {
                id: Number(fileId),
                update: {
                  assetIds: {
                    add: [asset.id],
                  },
                },
              },
            ])
          ),
        ]);
      }
    };

    const annotation = getState().previewSlice.annotations.byId[annotationId];

    if (annotation && annotation.status === AnnotationStatus.Verified) {
      const model = getState().previewSlice.models.byId[annotation.modelId];

      if (model.modelType === DetectionModelType.Tag) {
        const { fileId } = model;
        await updateFileAndSaveAnnotation(fileId, annotation.text, annotation);
      }
    }
  }
);
