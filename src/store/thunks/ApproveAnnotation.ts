import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { AnnotationStatus, VisionAnnotation } from 'src/utils/AnnotationUtils';
import { VisionAPIType } from 'src/api/types';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import {
  VisionAnnotationState,
  VisionModelState,
} from 'src/modules/Review/previewSlice';
import { FileState } from 'src/modules/Common/filesSlice';
import { UpdateAnnotations } from 'src/store/thunks/UpdateAnnotations';
import { ToastUtils } from 'src/utils/ToastUtils';

export const ApproveAnnotation = createAsyncThunk<
  void,
  VisionAnnotation,
  ThunkConfig
>('ApproveAnnotation', async (annotation, { getState, dispatch }) => {
  const updateFileAndAnnotation = async (
    file: FileState,
    model: VisionModelState,
    updatedAnnotation: VisionAnnotationState
  ) => {
    const unSavedAnnotation = { ...updatedAnnotation };

    dispatch(UpdateAnnotations([unSavedAnnotation])); // update annotation

    if (!(model.modelType === VisionAPIType.TagDetection)) {
      // stop processing if not tag annotation
      return;
    }

    const assetResponse = await dispatch(
      fetchAssets([{ externalId: updatedAnnotation.text }])
    );
    const assets = unwrapResult(assetResponse);

    if (assets && assets.length) {
      const asset = assets[0]; // get the first (and only) asset

      if (unSavedAnnotation.status === AnnotationStatus.Verified) {
        if (!(file.assetIds && file.assetIds.includes(asset.id))) {
          // if file not linked to asset
          await dispatch(
            UpdateFiles([
              {
                id: Number(file.id),
                update: {
                  assetIds: {
                    add: [asset.id],
                  },
                },
              },
            ])
          );
        }
      } else if (annotation.status === AnnotationStatus.Rejected) {
        if (file.assetIds && file.assetIds.includes(asset.id)) {
          // if file linked to asset

          const removeAssetIds = async (fileId: number, assetId: number) => {
            await dispatch(
              UpdateFiles([
                {
                  id: Number(fileId),
                  update: {
                    assetIds: {
                      remove: [assetId],
                    },
                  },
                },
              ])
            );
          };
          ToastUtils.onWarn(
            'Rejecting detected asset tag',
            'Do you want to remove the link between the file and the asset as well?',
            () => {
              removeAssetIds(file.id, asset.id);
            },
            'Remove asset link'
          );
        }
      }
    }
  };

  const annotationState =
    getState().previewSlice.annotations.byId[annotation.id];
  const model = getState().previewSlice.models.byId[annotationState.modelId];
  const file = getState().filesSlice.files.byId[model.fileId];

  await updateFileAndAnnotation(file, model, {
    ...annotationState,
    ...annotation,
  });
});
