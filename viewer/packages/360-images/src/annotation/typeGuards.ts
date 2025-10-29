/*!
 * Copyright 2025 Cognite AS
 */
import {
  AnnotationData,
  AnnotationModel,
  AnnotationsObjectDetection,
  AnnotationsTypesImagesAssetLink,
  AnnotationsTypesImagesInstanceLink,
  AnnotationType
} from '@cognite/sdk';
import { DataSourceType, DMDataSourceType, ImageInstanceLinkAnnotationInfo } from '@reveal/data-providers';
import { isDmIdentifier } from '@reveal/utilities';

export function isCoreDmImage360Annotation(
  annotation: DataSourceType['image360AnnotationType']
): annotation is DMDataSourceType['image360AnnotationType'] {
  const castAnnotation = annotation as DMDataSourceType['image360AnnotationType'];
  const dmsIdentifier = castAnnotation.annotationIdentifier;
  return dmsIdentifier !== undefined && isDmIdentifier(dmsIdentifier);
}

export function isAnnotationsObjectDetection(
  annotationType: AnnotationType,
  annotation: AnnotationData
): annotation is AnnotationsObjectDetection {
  const detection = annotation as AnnotationsObjectDetection;
  return (
    annotationType === 'images.ObjectDetection' &&
    detection.label !== undefined &&
    (detection.boundingBox !== undefined || detection.polygon !== undefined || detection.polyline !== undefined)
  );
}

export function isAnnotationAssetLink(
  annotationType: AnnotationType,
  annotation: AnnotationData
): annotation is AnnotationsTypesImagesAssetLink {
  const link = annotation as AnnotationsTypesImagesAssetLink;
  return annotationType === 'images.AssetLink' && link.text !== undefined && link.textRegion !== undefined;
}

export function isAnnotationInstanceLink(annotation: AnnotationModel): annotation is ImageInstanceLinkAnnotationInfo {
  return isAnnotationsTypesImagesInstanceLink(annotation.data);
}

export function isAnnotationsTypesImagesInstanceLink(
  annotationData: AnnotationData
): annotationData is AnnotationsTypesImagesInstanceLink {
  const data = annotationData as AnnotationsTypesImagesInstanceLink;
  return data.text !== undefined && data.textRegion !== undefined && data.instanceRef !== undefined;
}
