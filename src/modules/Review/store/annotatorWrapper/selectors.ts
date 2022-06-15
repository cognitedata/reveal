import isFinite from 'lodash-es/isFinite';
import { createSelector } from '@reduxjs/toolkit';
import { AnnotatorWrapperState } from 'src/modules/Review/store/annotatorWrapper/type';
import { RootState } from 'src/store/rootReducer';
import {
  PredefinedKeypointCollection,
  ReviewKeypoint,
  TempKeypointCollection,
} from 'src/modules/Review/types';

/**
 * Selects next predefined shape based on last shape annotation created
 * or latest predefined shape
 */
export const selectNextPredefinedShape = createSelector(
  (state: RootState) => state.reviewSlice.annotationSettings.createNew,
  (state: RootState) =>
    state.annotatorWrapperReducer.predefinedAnnotations.predefinedShapes,
  (state: RootState) => state.annotatorWrapperReducer.lastShape,
  (annotationSettingsNewLabel, predefinedShapes, lastShape) => {
    let shape = predefinedShapes[0];
    const nextShapeName = annotationSettingsNewLabel.text || lastShape;
    if (nextShapeName) {
      const template = predefinedShapes.find(
        (c) => c.shapeName === nextShapeName
      );
      if (template) {
        shape = template;
      }
    }
    return shape;
  }
);

/**
 * Selects next predefined keypoint collection based on last keypoint annotation created
 * or latest predefined keypoint collection
 */
export const selectNextPredefinedKeypointCollection = createSelector(
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

/**
 * selects last keypoint collection
 */
// todo: since this is the temp keypoint collection, move it into a separate state within slice
export const selectLastKeypointCollection = createSelector(
  (state: AnnotatorWrapperState) => state.lastCollectionId,
  (state: AnnotatorWrapperState) => state.collections.byId,
  (lastCollectionId, collectionState) => {
    if (lastCollectionId !== undefined && isFinite(lastCollectionId)) {
      return collectionState[lastCollectionId];
    }
    return null;
  }
);

/**
 * This selector will return TempKeypointCollection or
 * null if lastCollectionId is not available in state
 */
export const selectTempKeypointCollection = createSelector(
  (state: AnnotatorWrapperState, currentFileId: number) => currentFileId,
  selectLastKeypointCollection,
  (state: AnnotatorWrapperState) => state.keypointMap.byId,
  (state: AnnotatorWrapperState) => state.keypointMap.selectedIds,
  (state: AnnotatorWrapperState) =>
    state.predefinedAnnotations.predefinedKeypointCollections,
  (
    fileId,
    lastKeypointCollection,
    allKeypoints,
    selectedKeypointIds,
    predefinedKeypointCollections
  ) => {
    if (lastKeypointCollection) {
      const reviewImageKeypoints: ReviewKeypoint[] =
        lastKeypointCollection.keypointIds.map((keypointId: string) => ({
          id: keypointId,
          selected: selectedKeypointIds.includes(keypointId),
          keypoint: allKeypoints[keypointId],
        }));

      const predefinedCollection: PredefinedKeypointCollection | undefined =
        predefinedKeypointCollections.find(
          (template) => template.collectionName === lastKeypointCollection.label
        );
      const remainingKeypoints =
        predefinedCollection?.keypoints?.filter(
          (keypoint) =>
            !reviewImageKeypoints
              .map((reviewImageKeypoint) => reviewImageKeypoint.keypoint.label)
              .includes(keypoint.caption)
        ) || [];

      return {
        id: lastKeypointCollection.id,
        annotatedResourceId: fileId,
        data: {
          keypoints: reviewImageKeypoints,
          label: lastKeypointCollection.label,
        },
        remainingKeypoints,
      } as TempKeypointCollection;
    }
    return null;
  }
);
