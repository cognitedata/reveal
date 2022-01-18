import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { VisionFile } from 'src/modules/Common/store/files/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { UpdateFiles } from 'src/store/thunks/Files/UpdateFiles';
import { AnnotationStatus, VisionAnnotation } from 'src/utils/AnnotationUtils';
import { VisionAPIType } from 'src/api/types';
import { ToastUtils } from 'src/utils/ToastUtils';

export const AnnotationStatusChange = createAsyncThunk<
  void,
  { id: number; status: AnnotationStatus },
  ThunkConfig
>('AnnotationStatusChange', async (payload, { getState, dispatch }) => {
  const updateFileAndAnnotation = async (
    file: VisionFile,
    updatedAnnotation: VisionAnnotation
  ) => {
    const unSavedAnnotation = { ...updatedAnnotation };

    if (!(updatedAnnotation.modelType === VisionAPIType.TagDetection)) {
      dispatch(UpdateAnnotations([unSavedAnnotation])); // update annotation
      return;
    }
    // eslint-disable-next-line no-nested-ternary
    const assetsToFetch = updatedAnnotation.linkedResourceId
      ? { id: updatedAnnotation.linkedResourceId }
      : updatedAnnotation.linkedResourceExternalId
      ? { externalId: updatedAnnotation.linkedResourceExternalId }
      : { externalId: updatedAnnotation.text };

    const assetResponse = await dispatch(fetchAssets([assetsToFetch]));
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
      } else if (unSavedAnnotation.status === AnnotationStatus.Rejected) {
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

    dispatch(UpdateAnnotations([unSavedAnnotation])); // update annotation
  };

  const annotationState =
    getState().annotationReducer.annotations.byId[payload.id];
  const file =
    getState().fileReducer.files.byId[annotationState.annotatedResourceId];

  await updateFileAndAnnotation(file, {
    ...annotationState,
    status: payload.status,
  });
});
