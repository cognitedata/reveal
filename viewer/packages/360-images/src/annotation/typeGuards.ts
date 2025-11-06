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
import {
  DataSourceType,
  DMDataSourceType,
  ImageAssetLinkAnnotationInfo,
  ImageInstanceLinkAnnotationInfo
} from '@reveal/data-providers';
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

export function isImageAssetLinkAnnotation(annotation: AnnotationModel): annotation is ImageAssetLinkAnnotationInfo {
  return isAssetLinkAnnotationData(annotation.data);
}

export function isAssetLinkAnnotationData(
  annotationData: AnnotationData
): annotationData is AnnotationsTypesImagesAssetLink {
  const data = annotationData as AnnotationsTypesImagesAssetLink;
  return data.text !== undefined && data.textRegion !== undefined && data.assetRef !== undefined;
}

export function isImageInstanceLinkAnnotation(
  annotation: AnnotationModel
): annotation is ImageInstanceLinkAnnotationInfo {
  return isAnnotationsTypesImagesInstanceLink(annotation.data);
}

export function isAnnotationsTypesImagesInstanceLink(
  annotationData: AnnotationData
): annotationData is AnnotationsTypesImagesInstanceLink {
  const data = annotationData as AnnotationsTypesImagesInstanceLink;
  return data.text !== undefined && data.textRegion !== undefined && data.instanceRef !== undefined;
}
