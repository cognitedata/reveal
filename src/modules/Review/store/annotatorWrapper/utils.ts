/* eslint-disable no-param-reassign */

import { Keypoint } from 'src/api/annotation/types';
import { AnnotatorPointRegion } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';
import { AnnotatorWrapperState } from 'src/modules/Review/store/annotatorWrapper/type';

export const deleteCollection = (
  state: AnnotatorWrapperState,
  collectionId: number
) => {
  const collection = state.collections.byId[collectionId];
  if (collection) {
    delete state.collections.byId[collection.id];
    state.collections.allIds = Object.keys(state.collections.byId).map(
      (key) => +key
    );

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

export const getKeypointForAnnotatorPointRegion = (
  region: AnnotatorPointRegion
): [string, Keypoint] | null => {
  const { keypointLabel, x, y } = region;

  if (keypointLabel) {
    const keypointData: Keypoint = {
      point: { x, y },
      confidence: 1, // 100% confident about manually created keypoints
    };

    return [keypointLabel, keypointData];
  }
  return null;
};

export const populateTempKeypointCollection = (
  state: AnnotatorWrapperState,
  region: AnnotatorPointRegion
) => {
  const { id, annotationLabelOrText, keypointLabel } = region;

  const keypointObj = getKeypointForAnnotatorPointRegion(region);

  if (state.lastCollectionId && annotationLabelOrText && keypointObj) {
    const tempCollection = state.collections.byId[state.lastCollectionId];
    tempCollection.keypointIds.push(String(id));

    // update keypoints
    state.lastKeyPoint = keypointLabel;
    state.keypointMap.byId[String(id)] = keypointObj;
    state.keypointMap.allIds = Object.keys(state.keypointMap.byId);
  } else {
    if (!state.lastCollectionId) {
      console.warn('temp keypoint collection is not available');
    }
    if (annotationLabelOrText && keypointLabel) {
      console.warn('annotation label or keypoint label not found');
    }
  }
};
