import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { deleteAnnotations } from 'src/store/commonActions';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import { VisionAnnotationState } from '../previewSlice';

export const DeleteAnnotationsAndRemoveLinkedAssets = createAsyncThunk<
  void,
  string[],
  ThunkConfig
>(
  'DeleteAnnotationsAndRemoveLinkedAssets',
  async (annotationIds, { getState, dispatch }) => {
    const removeAssetIdsFromFile = (fileId: string, assetIds: number[]) => {
      dispatch(
        UpdateFiles([
          {
            id: Number(fileId),
            update: {
              assetIds: {
                remove: assetIds,
              },
            },
          },
        ])
      );
    };

    const linkedAnnotations: VisionAnnotationState[] = [];

    annotationIds.forEach((id) => {
      const annotation = getState().previewSlice.annotations.byId[id];

      if (
        annotation &&
        annotation.status === AnnotationStatus.Verified &&
        annotation.linkedAssetId
      ) {
        linkedAnnotations.push(annotation);
      }
    });

    if (linkedAnnotations.length) {
      const model = getState().previewSlice.models.byId[
        linkedAnnotations[0].modelId
      ];
      const { fileId } = model;
      const assetIds = linkedAnnotations.map((ann) => ann.linkedAssetId!);
      removeAssetIdsFromFile(fileId, assetIds);
    }

    dispatch(deleteAnnotations(linkedAnnotations.map((ann) => ann.id)));
  }
);
