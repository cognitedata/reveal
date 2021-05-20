import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import {
  AnnotationUtils,
  isAnnotation,
  isUnSavedAnnotation,
} from 'src/utils/AnnotationUtils';
import { SaveAnnotations } from 'src/store/thunks/SaveAnnotations';
import { UpdateAnnotations } from 'src/store/thunks/UpdateAnnotations';

export const SaveAvailableAnnotations = createAsyncThunk<
  void,
  void,
  ThunkConfig
>('SaveAvailableAnnotations', async (a, { getState, dispatch }) => {
  const allAnnotations = Object.values(
    getState().previewSlice.annotations.byId
  );
  const annotationsWithoutVirtualAssetAnnotations = allAnnotations.filter(
    (ann) => !ann.virtual
  );
  const annotations = annotationsWithoutVirtualAssetAnnotations.map((ann) =>
    AnnotationUtils.convertToAnnotation(ann)
  );

  const updateTheseAnnotations = annotations.filter(isAnnotation);
  const createTheseAnnotations = annotations.filter(isUnSavedAnnotation);

  await Promise.all([
    dispatch(SaveAnnotations(createTheseAnnotations)),
    dispatch(UpdateAnnotations(updateTheseAnnotations)),
  ]);

  // const [savedVisionAnnotations, updatedVisionAnnotations] = responses
  //   .map((res) => unwrapResult(res))
  //   .map((res) => res.data.items)
  //   .map((ann) => AnnotationUtils.convertToVisionAnnotations(ann));
  //
  // dispatch(
  //   deleteAnnotationsFromState(
  //     annotationsWithoutVirtualAssetAnnotations.map((item) => item.id)
  //   )
  // );
  // addAnnotations(savedVisionAnnotations.concat(updatedVisionAnnotations));
});
