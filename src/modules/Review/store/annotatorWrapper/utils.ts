/* eslint-disable no-param-reassign */
import isFinite from 'lodash-es/isFinite';
import { Keypoint } from 'src/api/annotation/types';
import { AnnotatorPointRegion } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';
import {
  AnnotatorWrapperState,
  KeypointState,
} from 'src/modules/Review/store/annotatorWrapper/type';

export const deleteCollection = (
  state: AnnotatorWrapperState,
  collectionId: number
) => {
  const collection = state.collections.byId[collectionId];
  const { keypointIds } = collection;
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

    if (keypointIds.length) {
      keypointIds.forEach((deletedKeypointId) => {
        delete state.keypointMap.byId[deletedKeypointId];
      });
      // remove deleted keypoint ids from selected list
      state.keypointMap.selectedIds = state.keypointMap.selectedIds.filter(
        (id: string) => !keypointIds.includes(id)
      );
      state.keypointMap.allIds = Object.keys(state.keypointMap.byId);
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
): KeypointState | null => {
  const { keypointLabel, x, y } = region;

  if (isFinite(x) && isFinite(y) && keypointLabel) {
    const keypointData: Keypoint = {
      point: { x, y },
      confidence: 1, // 100% confident about manually created keypoints
    };

    return { label: keypointLabel, ...keypointData };
  }
  return null;
};

export const populateTempKeypointCollection = (
  state: AnnotatorWrapperState,
  region: AnnotatorPointRegion
) => {
  const { id, annotationLabelOrText, keypointLabel } = region;

  const keypointObj = getKeypointForAnnotatorPointRegion(region);

  if (state.lastCollectionId && id && annotationLabelOrText && keypointObj) {
    const tempCollection = state.collections.byId[state.lastCollectionId];

    if (tempCollection && annotationLabelOrText === tempCollection.label) {
      // validate with predefined collection
      // todo: refactor below predefined annotation validation logic with useIsCurrentKeypointCollectionComplete to remove duplicate code
      const predefinedKeypointCollection =
        state.predefinedAnnotations.predefinedKeypointCollections.find(
          (predefinedCollection) =>
            predefinedCollection.collectionName === tempCollection.label
        );
      if (predefinedKeypointCollection) {
        const createdKeypointLabels = tempCollection.keypointIds.map(
          (keypointId) => state.keypointMap.byId[keypointId].label
        );
        const remainingKeypointLabels = predefinedKeypointCollection
          .keypoints!.filter(
            (keypoint) => !createdKeypointLabels.includes(keypoint.caption)
          )
          .map((keypoint) => keypoint.caption);

        // keypoint is one of the remaining ones
        if (remainingKeypointLabels.includes(keypointLabel)) {
          tempCollection.keypointIds.push(String(id));

          // update keypoints
          state.lastKeyPoint = keypointLabel;
          state.keypointMap.byId[String(id)] = keypointObj;
          state.keypointMap.allIds = Object.keys(state.keypointMap.byId);
        } else {
          console.warn(
            'Error occurred: keypoint collection already complete or predefined annotation metadata is missing'
          );
        }
      } else {
        console.warn(
          'Error occurred: predefined keypoint collection does not exist'
        );
      }
    } else {
      console.warn(
        'Error occurred: temp keypoint collection does not exist or provided region cannot be added to existing temp keypoint collection'
      );
    }
  } else {
    if (!state.lastCollectionId) {
      console.warn('temp keypoint collection is not available');
    }
    if (!keypointObj) {
      console.warn('keypoint data not found');
    }
    if (!id || !annotationLabelOrText || !keypointLabel) {
      console.warn('id, annotation label or keypoint label not found');
    }
  }
};
