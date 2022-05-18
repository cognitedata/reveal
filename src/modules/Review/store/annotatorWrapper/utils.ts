/* eslint-disable no-param-reassign */

import { AnnotatorWrapperState } from 'src/modules/Review/store/annotatorWrapper/type';

export const deleteCollection = (
  state: AnnotatorWrapperState,
  collectionId: string
) => {
  const collection = state.collections.byId[collectionId];
  if (collection) {
    delete state.collections.byId[collection.id];
    state.collections.allIds = Object.keys(state.collections.byId);

    // remove collection from selected list, if it was selected
    if (state.collections.selectedIds.includes(collectionId)) {
      state.collections.selectedIds = state.collections.selectedIds.filter(
        (item) => item !== collectionId
      );
    }

    if (collection.keypointIds.length) {
      const selectedKeyPointIds: string[] = [];
      collection.keypointIds.forEach((id) => {
        delete state.keypointMap.byId[id];

        // keep track of deleted ids that are also selected
        if (state.keypointMap.selectedIds.includes(id)) {
          selectedKeyPointIds.push(id);
        }
      });
      state.keypointMap.allIds = Object.keys(state.keypointMap.byId);

      // remove deleted keypoints from selected list
      state.keypointMap.selectedIds = state.keypointMap.selectedIds.filter(
        (i: string) => !selectedKeyPointIds.some((j) => j === i)
      );
    }
  } else {
    console.warn(
      `Cannot delete collection, collectionId ${collectionId} not found in state.`
    );
  }
  if (state.lastCollectionId === collectionId) {
    state.lastCollectionId = undefined;
  }
};
