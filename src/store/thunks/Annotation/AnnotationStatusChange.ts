import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { VisionAsset, VisionFile } from 'src/modules/Common/store/files/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { UpdateFiles } from 'src/store/thunks/Files/UpdateFiles';
import { ToastUtils } from 'src/utils/ToastUtils';
import { Status } from 'src/api/annotation/types';
import { InternalId } from '@cognite/sdk';
import { isImageAssetLinkData } from 'src/modules/Common/types/typeGuards';

/**
 * ## Example
 * ```typescript
 *   dispatch(AnnotationStatusChange({ id: 1, status: Status.Suggested }));
 * ```
 */

export const AnnotationStatusChange = createAsyncThunk<
  void,
  { id: number; status: Status },
  ThunkConfig
>('AnnotationStatusChange', async (payload, { getState, dispatch }) => {
  const updateFileLinkedAssets = async ({
    visionFile,
    status,
    assetRefId,
  }: {
    visionFile: VisionFile;
    status: Status;
    assetRefId: InternalId;
  }) => {
    const assetResponse = await dispatch(fetchAssets([assetRefId]));
    const assets = unwrapResult(assetResponse);
    const asset = assets && assets.length ? assets[0] : null; // get the first (and only) asset

    // just return if asset does not exist in CDF
    if (!asset) {
      return;
    }

    if (
      status === Status.Approved &&
      !fileIsLinkedToAsset(visionFile, asset) // annotation is verified and file is not linked to asset
    ) {
      dispatch(
        UpdateFiles([
          {
            id: Number(visionFile.id),
            update: {
              assetIds: {
                add: [asset.id],
              },
            },
          },
        ])
      );
    } else if (
      status === Status.Rejected &&
      fileIsLinkedToAsset(visionFile, asset) // annotation is rejected and file linked to asset
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
          removeAssetIds(visionFile.id, asset.id);
        },
        'Remove asset link'
      );
    }
  };

  const visionAnnotation =
    getState().annotationReducer.annotations.byId[payload.id];
  const visionFile =
    getState().fileReducer.files.byId[visionAnnotation.annotatedResourceId];

  dispatch(
    UpdateAnnotations([
      { id: payload.id, update: { status: { set: payload.status } } },
    ])
  );

  // if annotation represents an asset link, also update the file's linked assets
  if (isImageAssetLinkData(visionAnnotation)) {
    const assetRefId = { id: visionAnnotation.assetRef.id };
    await updateFileLinkedAssets({
      visionFile,
      status: payload.status,
      assetRefId,
    });
  }
});

const fileIsLinkedToAsset = (file: VisionFile, asset: VisionAsset) =>
  file.assetIds && file.assetIds.includes(asset.id);
