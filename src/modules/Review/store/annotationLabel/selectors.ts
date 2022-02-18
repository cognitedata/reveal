import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/store/rootReducer';
import { KeypointItem } from 'src/utils/AnnotationUtils';
import { AnnotationLabelState } from './types';

export const nextKeypoint = createSelector(
  (state: AnnotationLabelState) =>
    state.predefinedAnnotations.predefinedKeypoints,
  (state: AnnotationLabelState) => state.collections.byId,
  (state: AnnotationLabelState) => state.keypointMap.byId,
  (state: AnnotationLabelState) => state.lastCollectionName,
  (state: AnnotationLabelState) => state.lastKeyPoint,
  (
    keyPointCollectionTemplates,
    allCollections,
    allKeypoints,
    lastCollectionName,
    lastKeyPointId
  ) => {
    const lastKeyPoint = lastKeyPointId ? allKeypoints[lastKeyPointId] : null;
    const template =
      keyPointCollectionTemplates.find(
        (tmp) => tmp.collectionName === lastCollectionName
      ) || keyPointCollectionTemplates[0];

    if (template && template.keypoints && template.keypoints.length) {
      let nextPoint;
      if (lastKeyPoint) {
        const lastKeypointIndex = template.keypoints.findIndex(
          (keyPoint) =>
            keyPoint.order === lastKeyPoint.order &&
            keyPoint.caption === lastKeyPoint.caption &&
            keyPoint.color === lastKeyPoint.color
        );
        const nextIndex = lastKeypointIndex >= 0 ? lastKeypointIndex + 1 : 0;
        if (nextIndex === template.keypoints.length) {
          // eslint-disable-next-line prefer-destructuring
          nextPoint = template.keypoints[0];
        } else {
          nextPoint = template.keypoints[nextIndex];
        }
      } else {
        // eslint-disable-next-line prefer-destructuring
        nextPoint = template.keypoints[0];
      }

      return nextPoint;
    }
    return null;
  }
);

export const nextShape = createSelector(
  (state: RootState) => state.reviewSlice.annotationSettings.createNew,
  (state: RootState) =>
    state.annotationLabelReducer.predefinedAnnotations.predefinedShapes,
  (state: RootState) => state.annotationLabelReducer.lastShape,
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
    state.annotationLabelReducer.predefinedAnnotations.predefinedKeypoints,
  (state: RootState) => state.annotationLabelReducer.lastCollectionName,
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

export const currentCollection = createSelector(
  (state: AnnotationLabelState) => state.lastCollectionId,
  (state: AnnotationLabelState) => state.collections.byId,
  (state: AnnotationLabelState) => state.collections.selectedIds,
  (state: AnnotationLabelState) => state.keypointMap.byId,
  (state: AnnotationLabelState) => state.keypointMap.selectedIds,
  (state: AnnotationLabelState) =>
    state.predefinedAnnotations.predefinedKeypoints,
  (
    lastCollectionId,
    allCollections,
    selectedCollectionIds,
    allKeypoints,
    selectedKeypointIds,
    collectionTemplate
  ) => {
    if (lastCollectionId) {
      const collection = allCollections[lastCollectionId];
      const keypoints = collection.keypointIds.map(
        (id) =>
          ({
            ...allKeypoints[id],
            selected: selectedKeypointIds.includes(id),
          } as KeypointItem)
      );
      const predefinedKeypoints = collectionTemplate.find(
        (template) => template.collectionName === collection.name
      )?.keypoints as KeypointItem[];
      const remainingKeypoints = predefinedKeypoints?.filter(
        (point) => !keypoints.some((k) => k.caption === point.caption)
      );

      return {
        ...collection,
        selected: selectedCollectionIds.includes(collection.id),
        keypoints,
        remainingKeypoints,
      };
    }
    return null;
  }
);

export const keypointsCompleteInCollection = createSelector(
  (state: AnnotationLabelState) => state.lastCollectionId,
  (state: AnnotationLabelState) => state.collections.byId,
  (state: AnnotationLabelState) => state.keypointMap.byId,
  (state: AnnotationLabelState) =>
    state.predefinedAnnotations.predefinedKeypoints,
  (lastCollectionId, allCollections, allKeyPoints, collectionTemplate) => {
    if (lastCollectionId) {
      const collection = allCollections[lastCollectionId];
      const predefinedCollection = collectionTemplate.find(
        (template) => template.collectionName === collection.name
      );
      const templateKeypoints = predefinedCollection!.keypoints;
      const createdKeyPointOrderNumbers = collection.keypointIds.map(
        (id) => allKeyPoints[id].order
      );
      const completedKeypoints = templateKeypoints!.filter((kpoint) =>
        createdKeyPointOrderNumbers.includes(kpoint.order)
      );
      return [completedKeypoints.length, templateKeypoints?.length];
    }
    return null;
  }
);
