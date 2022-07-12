import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import {
  PredefinedVisionAnnotations,
  PredefinedKeypointCollection,
  PredefinedShape,
} from 'src/modules/Review/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { LegacyAnnotationApi } from 'src/api/annotation/legacy/legacyAnnotationApi';
import { LegacyUnsavedAnnotation } from 'src/api/annotation/legacy/legacyTypes';
import { PopulateAnnotationTemplates } from 'src/store/thunks/Annotation/PopulateAnnotationTemplates';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { LegacyAnnotationUtils } from 'src/api/annotation/legacy/legacyAnnotationUtils';

export const SaveAnnotationTemplates = createAsyncThunk<
  PredefinedVisionAnnotations,
  PredefinedVisionAnnotations,
  ThunkConfig
>('SaveAnnotationTemplates', async (templateData, { dispatch }) => {
  // first retrieve annotationTemplate data from CDF

  const savedConfigurationsResponse = await dispatch(
    PopulateAnnotationTemplates()
  );
  const savedConfiguration = unwrapResult(savedConfigurationsResponse);
  const unsavedShapes: PredefinedShape[] = [];
  const unsavedKeypointCollections: PredefinedKeypointCollection[] = [];
  const unsavedAnnotations: LegacyUnsavedAnnotation[] = [];

  templateData.predefinedShapes.forEach((shape, index) => {
    if (!shape.id) {
      if (
        savedConfiguration.predefinedShapes.find(
          (savedShape) => savedShape.shapeName.trim() === shape.shapeName.trim()
        ) ||
        templateData.predefinedShapes.findIndex(
          (savedShape) => savedShape.shapeName.trim() === shape.shapeName.trim()
        ) !== index
      ) {
        throw Error(
          `Shape: ${shape.shapeName} cannot be added since it already exists`
        );
      } else {
        unsavedShapes.push(shape);
      }
    }
  });

  templateData.predefinedKeypointCollections.forEach(
    (keypointCollection, index) => {
      if (!keypointCollection.id) {
        if (
          savedConfiguration.predefinedKeypointCollections.find(
            (savedShape) =>
              savedShape.collectionName.trim() ===
              keypointCollection.collectionName.trim()
          ) ||
          templateData.predefinedKeypointCollections.findIndex(
            (savedShape) =>
              savedShape.collectionName.trim() ===
              keypointCollection.collectionName.trim()
          ) !== index
        ) {
          throw Error(
            `Keypoint collection: ${keypointCollection.collectionName} cannot be added since it already exists`
          );
        } else {
          unsavedKeypointCollections.push(keypointCollection);
        }
      }
    }
  );

  if (unsavedShapes.length) {
    unsavedShapes.forEach((unsavedShape) => {
      unsavedAnnotations.push({
        text: unsavedShape.shapeName,
        region: undefined,
        source: 'user',
        annotationType: 'CDF_ANNOTATION_TEMPLATE',
        data: {
          color: unsavedShape.color,
        },
        annotatedResourceType: 'file',
        annotatedResourceId: 0,
      });
    });
  }

  if (unsavedKeypointCollections.length) {
    unsavedKeypointCollections.forEach((unsavedKeypointCollection) => {
      unsavedAnnotations.push({
        text: unsavedKeypointCollection.collectionName,
        region: undefined,
        source: 'user',
        annotationType: 'CDF_ANNOTATION_TEMPLATE',
        data: {
          keypoint: true,
          keypoints: unsavedKeypointCollection.keypoints,
          color: unsavedKeypointCollection.color,
        },
        annotatedResourceType: 'file',
        annotatedResourceId: 0,
      });
    });
  }

  const keypointCollections: PredefinedKeypointCollection[] = [
    ...savedConfiguration.predefinedKeypointCollections,
  ];
  const shapes: PredefinedShape[] = [...savedConfiguration.predefinedShapes];

  if (unsavedAnnotations.length) {
    const data = { items: unsavedAnnotations };
    const response = await LegacyAnnotationApi.create(data);
    const templateAnnotations = response.data.items;
    templateAnnotations.forEach((templateAnnotation) => {
      if (templateAnnotation.data?.keypoint && templateAnnotation.data.color) {
        keypointCollections.push({
          id: templateAnnotation.id,
          lastUpdated: templateAnnotation.lastUpdatedTime,
          keypoints: templateAnnotation.data.keypoints,
          collectionName: templateAnnotation.text,
          color: templateAnnotation.data.color,
        });
      } else {
        shapes.push({
          id: templateAnnotation.id,
          lastUpdated: templateAnnotation.lastUpdatedTime,
          color: LegacyAnnotationUtils.getAnnotationColor(
            templateAnnotation.text,
            VisionDetectionModelType.ObjectDetection,
            templateAnnotation.data
          ),
          shapeName: templateAnnotation.text,
        });
      }
    });
  }

  return {
    predefinedKeypointCollections: keypointCollections,
    predefinedShapes: shapes,
  };
});
