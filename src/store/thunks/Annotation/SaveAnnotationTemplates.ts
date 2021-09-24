import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import {
  AnnotationCollection,
  KeypointCollection,
  Shape,
} from 'src/modules/Common/Components/CollectionSettingsModal/CollectionSettingsTypes';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';
import { PopulateAnnotationTemplates } from 'src/store/thunks/Annotation/PopulateAnnotationTemplates';
import { AnnotationUtils } from 'src/utils/AnnotationUtils';
import { VisionAPIType } from 'src/api/types';

export const SaveAnnotationTemplates = createAsyncThunk<
  AnnotationCollection,
  AnnotationCollection,
  ThunkConfig
>('SaveAnnotationTemplates', async (templateData, { dispatch }) => {
  // first retrieve annotationTemplate data from CDF

  const savedConfigurationsResponse = await dispatch(
    PopulateAnnotationTemplates()
  );
  const savedConfiguration = unwrapResult(savedConfigurationsResponse);
  const unsavedShapes: Shape[] = [];
  const unsavedKeypointCollections: KeypointCollection[] = [];
  const unsavedAnnotations: UnsavedAnnotation[] = [];

  templateData.predefinedShapes.forEach((shape) => {
    if (!shape.id) {
      if (
        savedConfiguration.predefinedShapes.find(
          (savedShape) => savedShape.shapeName.trim() === shape.shapeName.trim()
        )
      ) {
        throw Error(
          `Shape: ${shape.shapeName} cannot be added since it already exists`
        );
      } else {
        unsavedShapes.push(shape);
      }
    }
  });

  templateData.predefinedKeypoints.forEach((keypointCollection) => {
    if (!keypointCollection.id) {
      if (
        savedConfiguration.predefinedKeypoints.find(
          (savedShape) =>
            savedShape.collectionName.trim() ===
            keypointCollection.collectionName.trim()
        )
      ) {
        throw Error(
          `Keypoint collection: ${keypointCollection.collectionName} cannot be added since it already exists`
        );
      } else {
        unsavedKeypointCollections.push(keypointCollection);
      }
    }
  });

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
        },
        annotatedResourceType: 'file',
        annotatedResourceId: 0,
      });
    });
  }

  const keypointCollections: KeypointCollection[] = [
    ...savedConfiguration.predefinedKeypoints,
  ];
  const shapes: Shape[] = [...savedConfiguration.predefinedShapes];

  if (unsavedAnnotations.length) {
    const data = { items: unsavedAnnotations };
    const response = await AnnotationApi.create(data);
    const templateAnnotations = response.data.items;
    templateAnnotations.forEach((templateAnnotation) => {
      if (templateAnnotation.data?.keypoint) {
        keypointCollections.push({
          id: templateAnnotation.id,
          lastUpdated: templateAnnotation.lastUpdatedTime,
          keypoints: templateAnnotation.data.keypoints,
          collectionName: templateAnnotation.text,
        });
      } else {
        shapes.push({
          id: templateAnnotation.id,
          lastUpdated: templateAnnotation.lastUpdatedTime,
          color: AnnotationUtils.getAnnotationColor(
            templateAnnotation.text,
            VisionAPIType.ObjectDetection,
            templateAnnotation.data
          ),
          shapeName: templateAnnotation.text,
        });
      }
    });
  }

  return {
    predefinedKeypoints: keypointCollections,
    predefinedShapes: shapes,
  };
});
