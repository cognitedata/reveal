import {
  AnnotationData,
  AnnotationsCogniteAnnotationTypesImagesAssetLink,
  AnnotationsObjectDetection,
  AnnotationType
} from '@cognite/sdk';
import { DataSourceType, DMDataSourceType } from '@reveal/data-providers';
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
): annotation is AnnotationsCogniteAnnotationTypesImagesAssetLink {
  const link = annotation as AnnotationsCogniteAnnotationTypesImagesAssetLink;
  return annotationType === 'images.AssetLink' && link.text !== undefined && link.textRegion !== undefined;
}
