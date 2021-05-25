import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import { DeleteAnnotations } from 'src/store/thunks/DeleteAnnotations';
import { deleteAnnotationsFromState } from 'src/store/commonActions';
import { VisionAnnotationState } from '../../modules/Review/previewSlice';

export const DeleteAnnotationsAndRemoveLinkedAssets = createAsyncThunk<
  void,
  number[],
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

    const annotations = annotationIds.map(
      (id) => getState().previewSlice.annotations.byId[id]
    );
    const linkedAnnotations: VisionAnnotationState[] = [];

    annotations.forEach((annotation) => {
      if (
        annotation &&
        annotation.status === AnnotationStatus.Verified &&
        annotation.linkedResourceId
      ) {
        linkedAnnotations.push(annotation);
      }
    });

    if (linkedAnnotations.length) {
      const model =
        getState().previewSlice.models.byId[linkedAnnotations[0].modelId];
      const { fileId } = model;
      const assetIds = linkedAnnotations.map((ann) => ann.linkedResourceId!);
      removeAssetIdsFromFile(fileId, assetIds);
    }

    const savedAnnotationIds = annotations
      .filter((ann) => !!ann.lastUpdatedTime)
      .map((ann) => ann.id);

    if (savedAnnotationIds && savedAnnotationIds.length) {
      dispatch(DeleteAnnotations(savedAnnotationIds));
    }

    dispatch(deleteAnnotationsFromState(annotations.map((ann) => ann.id!)));
  }
);
