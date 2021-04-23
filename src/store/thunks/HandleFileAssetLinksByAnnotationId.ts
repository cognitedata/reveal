import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { VisionAPIType } from 'src/api/types';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import { VisionAnnotationState } from 'src/modules/Preview/previewSlice';
import { addAnnotations } from 'src/store/commonActions';
import { FileState } from 'src/modules/Upload/uploadedFilesSlice';

export const HandleFileAssetLinksByAnnotationId = createAsyncThunk<
  void,
  string,
  ThunkConfig
>(
  'HandleFileAssetLinksByAnnotationId',
  async (annotationId, { getState, dispatch }) => {
    const updateFileAndAnnotation = async (
      file: FileState,
      assetExternalId: string,
      annotation: VisionAnnotationState
    ) => {
      const assetResponse = await dispatch(
        fetchAssets([{ externalId: assetExternalId }])
      );
      const assets = unwrapResult(assetResponse);

      if (assets && assets.length) {
        const asset = assets[0];

        if (annotation.status === AnnotationStatus.Verified) {
          if (
            !annotation.linkedResourceId ||
            annotation.linkedResourceId !== asset.id
          ) {
            dispatch(
              addAnnotations([
                {
                  ...annotation,
                  linkedResourceId: asset.id,
                  linkedResourceExternalId: asset.externalId,
                  linkedResourceType: 'asset',
                },
              ])
            );
          }
          if (!(file.assetIds && file.assetIds.includes(asset.id))) {
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
          if (annotation.linkedResourceId === asset.id) {
            dispatch(
              addAnnotations([
                {
                  ...annotation,
                  linkedResourceId: undefined,
                  linkedResourceExternalId: undefined,
                  linkedResourceType: 'asset',
                },
              ])
            );
          }
          if (file.assetIds && file.assetIds.includes(asset.id)) {
            await dispatch(
              UpdateFiles([
                {
                  id: Number(file.id),
                  update: {
                    assetIds: {
                      remove: [asset.id],
                    },
                  },
                },
              ])
            );
          }
        }

        // if (annotation.box) {
        //   const unsavedAnnotation = AnnotationUtils.convertToAnnotation({
        //     ...annotation,
        //     linkedResourceId: asset.id,
        //     linkedResourceExternalId: asset.externalId,
        //     linkedResourceType: 'asset',
        //   });
        //   dispatch(SaveAnnotations([unsavedAnnotation]));
        // }
      }
    };

    const annotation = getState().previewSlice.annotations.byId[annotationId];
    const model = getState().previewSlice.models.byId[annotation.modelId];
    const file = getState().uploadedFiles.files.byId[model.fileId];

    if (model.modelType === VisionAPIType.TagDetection) {
      await updateFileAndAnnotation(file, annotation.text, annotation);
    }
  }
);
