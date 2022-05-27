import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { LegacyKeypointItemCollection } from 'src/modules/Review/types';
import { KeypointItem } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';

export const RetrieveKeypointCollection = createAsyncThunk<
  LegacyKeypointItemCollection | null,
  string,
  ThunkConfig
>('RetrieveKeypointCollection', async (collectionId, { getState }) => {
  const state = getState().annotationLabelReducer;
  const allCollections = state.collections.byId;
  const allKeypoints = state.keypointMap.byId;
  const selectedCollectionIds = state.collections.selectedIds;
  const selectedKeypointIds = state.keypointMap.selectedIds;
  const collection = allCollections[collectionId];
  const keypoints = collection.keypointIds.map(
    (id) =>
      ({
        ...allKeypoints[id],
        selected: selectedKeypointIds.includes(id),
      } as KeypointItem)
  );
  return {
    ...collection,
    selected: selectedCollectionIds.includes(collection.id),
    keypoints,
  };
});
