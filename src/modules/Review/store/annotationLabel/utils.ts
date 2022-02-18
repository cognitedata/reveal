/* eslint-disable no-param-reassign */

import { AnnotationLabelState } from './types';

export const deleteCollection = (
  state: AnnotationLabelState,
  collectionId: string
) => {
  const collection = state.collections.byId[collectionId];
  if (collection) {
    delete state.collections.byId[collection.id];
    state.collections.allIds = Object.keys(state.collections.byId);

    if (collection.keypointIds.length) {
      collection.keypointIds.forEach((id) => delete state.keypointMap.byId[id]);
      state.keypointMap.allIds = Object.keys(state.keypointMap.byId);
    }
  }
  if (state.lastCollectionId === collectionId) {
    state.lastCollectionId = undefined;
  }
};
