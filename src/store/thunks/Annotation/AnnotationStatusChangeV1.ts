import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { VisionAsset, VisionFile } from 'src/modules/Common/store/files/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { UpdateAnnotationsV1 } from 'src/store/thunks/Annotation/UpdateAnnotationsV1';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { UpdateFiles } from 'src/store/thunks/Files/UpdateFiles';
import {
  AnnotationStatus,
  VisionAnnotationV1,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { ToastUtils } from 'src/utils/ToastUtils';

export const AnnotationStatusChangeV1 = createAsyncThunk<
  void,
  { id: number; status: AnnotationStatus },
  ThunkConfig
>('AnnotationStatusChangeV1', async (payload, { getState, dispatch }) => {
  const updateTagAnnotationAndFileAssetLinks = async (
    file: VisionFile,
    updatedAnnotation: VisionAnnotationV1
  ) => {
    // eslint-disable-next-line no-nested-ternary
    const assetsToFetch = updatedAnnotation.linkedResourceId
      ? { id: updatedAnnotation.linkedResourceId }
      : updatedAnnotation.linkedResourceExternalId
      ? { externalId: updatedAnnotation.linkedResourceExternalId }
      : { externalId: updatedAnnotation.text };

    const assetResponse = await dispatch(fetchAssets([assetsToFetch]));
    const assets = unwrapResult(assetResponse);
    const asset = assets && assets.length ? assets[0] : null; // get the first (and only) asset

    if (!asset) {
      // preempt if asset is empty
      return;
    }

    if (
      updatedAnnotation.status === AnnotationStatus.Verified &&
      !fileIsLinkedToAsset(file, asset) // annotation is verified and file is not linked to asset
    ) {
      dispatch(
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
    } else if (
      unSavedAnnotation.status === AnnotationStatus.Rejected &&
      fileIsLinkedToAsset(file, asset) // annotation is rejected and file linked to asset
    ) {
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
  };

  const annotationState =
    getState().annotationV1Reducer.annotations.byId[payload.id];
  const file =
    getState().fileReducer.files.byId[annotationState.annotatedResourceId];

  const unSavedAnnotation = {
    ...annotationState,
    status: payload.status,
  };

  dispatch(UpdateAnnotationsV1([unSavedAnnotation]));

  if (unSavedAnnotation.modelType === VisionDetectionModelType.TagDetection) {
    await updateTagAnnotationAndFileAssetLinks(file, unSavedAnnotation); // update tag annotations and asset links in file
  }
});

const fileIsLinkedToAsset = (file: VisionFile, asset: VisionAsset) =>
  file.assetIds && file.assetIds.includes(asset.id);
