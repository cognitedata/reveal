import {
  type AnnotationData,
  type AnnotationModel,
  type AnnotationsTypesImagesAssetLink
} from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { type Image360AnnotationContent, type Image360AnnotationId } from './types';
import { type CoreDmImage360Annotation } from '@cognite/reveal';

export function isClassicImage360AnnotationId(
  annotationId: Image360AnnotationId
): annotationId is number {
  return typeof annotationId === 'number';
}

export function isDMImage360AnnotationId(
  annotationId: Image360AnnotationId
): annotationId is DmsUniqueIdentifier {
  return (
    (annotationId as DmsUniqueIdentifier).externalId !== undefined &&
    (annotationId as DmsUniqueIdentifier).space !== undefined
  );
}

export function isClassicImage360Annotation(
  annotation: Image360AnnotationContent
): annotation is AnnotationModel {
  return (
    (annotation as AnnotationModel).annotatedResourceType !== undefined &&
    (annotation as AnnotationModel).annotatedResourceId !== undefined
  );
}

export function isClassicImage360AssetAnnotationData(
  annotationData: AnnotationData
): annotationData is AnnotationsTypesImagesAssetLink {
  const data = annotationData as AnnotationsTypesImagesAssetLink;
  return data.text !== undefined && data.textRegion !== undefined && data.assetRef !== undefined;
}

export function isDMImage360Annotation(
  annotation: Image360AnnotationContent
): annotation is CoreDmImage360Annotation {
  return (annotation as CoreDmImage360Annotation).annotationIdentifier !== undefined;
}
