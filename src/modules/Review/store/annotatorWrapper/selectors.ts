import { createSelector } from '@reduxjs/toolkit';
import {
  AnnotatorWrapperState,
  KeypointCollectionState,
} from 'src/modules/Review/store/annotatorWrapper/type';
import { RootState } from 'src/store/rootReducer';
import {
  PredefinedKeypoint,
  PredefinedKeypointCollection,
  ReviewKeypoint,
} from 'src/modules/Review/types';

export const nextKeypoint = createSelector(
  (state: AnnotatorWrapperState) =>
    state.predefinedAnnotations.predefinedKeypointCollections,
  (state: AnnotatorWrapperState) => state.lastCollectionName,
  (state: AnnotatorWrapperState) => state.lastKeyPoint,
  (predefinedKeypointCollections, lastCollectionName, lastKeyPointLabel) => {
    const activePredefinedKeypointCollection =
      predefinedKeypointCollections.find(
        (predefinedKeypointCollection) =>
          predefinedKeypointCollection.collectionName === lastCollectionName
      ) || predefinedKeypointCollections[0];

    if (activePredefinedKeypointCollection) {
      const activeKeypoints = activePredefinedKeypointCollection.keypoints;

      if (activeKeypoints && activeKeypoints.length) {
        const lastKeyPointIndex = activeKeypoints.findIndex(
          (keypoint: PredefinedKeypoint) =>
            keypoint.caption === lastKeyPointLabel
        );
        if (
          lastKeyPointIndex &&
          activeKeypoints.length > lastKeyPointIndex + 1
        ) {
          return activeKeypoints[lastKeyPointIndex + 1];
        }
        return activeKeypoints[0];
      }
    }
    return null;
  }
);

export const nextShape = createSelector(
  (state: RootState) => state.reviewSlice.annotationSettings.createNew,
  (state: RootState) =>
    state.annotatorWrapperReducer.predefinedAnnotations.predefinedShapes,
  (state: RootState) => state.annotatorWrapperReducer.lastShape,
  (annotationSettingsNewLabel, predefinedShapes, lastShape) => {
    if (annotationSettingsNewLabel.text) {
      return annotationSettingsNewLabel.text;
    }
    if (lastShape) {
      return lastShape;
    }
    return predefinedShapes[0]?.shapeName || '';
  }
);

export const nextCollection = createSelector(
  (state: RootState) => state.reviewSlice.annotationSettings.createNew,
  (state: RootState) =>
    state.annotatorWrapperReducer.predefinedAnnotations
      .predefinedKeypointCollections,
  (state: RootState) => state.annotatorWrapperReducer.lastCollectionName,
  (
    annotationSettingsNewLabel,
    predefinedKeypointCollections,
    lastCollectionName
  ) => {
    let collection = predefinedKeypointCollections[0];
    if (annotationSettingsNewLabel.text || lastCollectionName) {
      const collectionLabel =
        annotationSettingsNewLabel.text || lastCollectionName;
      const template = predefinedKeypointCollections.find(
        (c) => c.collectionName === collectionLabel
      );
      if (template) {
        collection = template;
      }
    }
    return collection;
  }
);

/** This selector will return
 * current collection
 * & annotatedResourceId
 * & selected collection Ids
 * & already added keypoints
 * & remainingKeypoints
 */
export const currentCollection = createSelector(
  (state: AnnotatorWrapperState, currentFileId: number) => currentFileId,
  (state: AnnotatorWrapperState) => state.lastCollectionId,
  (state: AnnotatorWrapperState) => state.collections.byId,
  (state: AnnotatorWrapperState) => state.collections.selectedIds,
  (state: AnnotatorWrapperState) => state.keypointMap.byId,
  (state: AnnotatorWrapperState) => state.keypointMap.selectedIds,
  (state: AnnotatorWrapperState) =>
    state.predefinedAnnotations.predefinedKeypointCollections,
  (
    fileId,
    lastCollectionId,
    allCollections,
    selectedCollectionIds,
    allKeypoints,
    selectedKeypointIds,
    predefinedKeypointCollections
  ) => {
    if (lastCollectionId) {
      const collection = allCollections[lastCollectionId];
      const reviewImageKeypoints: ReviewKeypoint[] = collection.keypointIds.map(
        (keypointId: string) => ({
          id: keypointId,
          selected: selectedKeypointIds.includes(keypointId),
          keypoint: allKeypoints[keypointId],
        })
      );

      const predefinedCollection: PredefinedKeypointCollection | undefined =
        predefinedKeypointCollections.find(
          (template) => template.collectionName === collection.label
        );
      const remainingKeypoints =
        predefinedCollection?.keypoints?.filter(
          (keypoint) =>
            !reviewImageKeypoints
              .map((reviewImageKeypoint) => reviewImageKeypoint.keypoint.label)
              .includes(keypoint.caption)
        ) || [];

      return {
        ...collection,
        annotatedResourceId: fileId,
        selected: selectedCollectionIds.includes(collection.id),
        keypoints: reviewImageKeypoints,
        remainingKeypoints,
      };
    }
    return null;
  }
);

export const keypointsCompleteInCollection = createSelector(
  (state: AnnotatorWrapperState) => state.lastCollectionId,
  (state: AnnotatorWrapperState) => state.collections.byId,
  (state: AnnotatorWrapperState) =>
    state.predefinedAnnotations.predefinedKeypointCollections,
  (lastCollectionId, allCollections, predefinedKeypointCollections) => {
    if (lastCollectionId) {
      const collection: KeypointCollectionState =
        allCollections[lastCollectionId];
      const predefinedCollection: PredefinedKeypointCollection | undefined =
        predefinedKeypointCollections.find(
          (template) => template.collectionName === collection.label
        );
      const templateKeypoints = predefinedCollection!.keypoints;

      const completedKeypointIds = collection.keypointIds;

      return [completedKeypointIds.length, templateKeypoints?.length];
    }
    return null;
  }
);
