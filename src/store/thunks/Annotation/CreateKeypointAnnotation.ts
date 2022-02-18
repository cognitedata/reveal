import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { deleteCollectionById } from 'src/modules/Review/store/annotationLabel/slice';
import { KeypointItemCollection } from 'src/modules/Review/types';

/**
 * Will return keypoint item collection is it's complete else returns null
 */
export const CreateKeypointAnnotation = createAsyncThunk<
  KeypointItemCollection | null,
  void,
  ThunkConfig
>('CreateKeypointAnnotation', async (payload, { dispatch, getState }) => {
  const state = getState().annotationLabelReducer;
  const currentCollectionId = state.lastCollectionId;

  if (currentCollectionId) {
    const allCollections = state.collections.byId;
    const selectedCollectionIds = state.collections.selectedIds;
    const allKeypoints = state.keypointMap.byId;
    const selectedKeypointIds = state.keypointMap.selectedIds;
    const collectionTemplates = state.predefinedAnnotations.predefinedKeypoints;

    const collection = {
      ...allCollections[currentCollectionId],
      selected: selectedCollectionIds.includes(currentCollectionId),
    };
    const keypoints = collection.keypointIds.map((id) => ({
      ...allKeypoints[id],
      selected: selectedKeypointIds.includes(id),
    }));

    // check for completeness
    const predefinedCollection = collectionTemplates.find(
      (template) => template.collectionName === collection.name
    );
    const templateKeypoints = predefinedCollection!.keypoints;
    const createdKeyPointOrderNumbers = keypoints.map(
      (keypoint) => keypoint.order
    );
    const notCompletedKeypoints = templateKeypoints!.filter(
      (keypoint) => !createdKeyPointOrderNumbers.includes(keypoint.order)
    );

    if (notCompletedKeypoints.length === 0) {
      dispatch(deleteCollectionById(currentCollectionId));

      return {
        ...collection,
        keypoints,
      } as KeypointItemCollection;
    }
  }
  return null;
});
