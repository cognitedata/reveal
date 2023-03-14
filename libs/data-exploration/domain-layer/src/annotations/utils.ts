/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
  AnnotationSource,
  ANNOTATION_SOURCE_KEY,
  ExtendedAnnotation,
  TaggedAnnotation,
  TaggedAnnotationAnnotation,
  TaggedLocalAnnotation,
} from '@data-exploration-lib/core';

export const isExtendedLocalAnnotation = (
  annotation: ExtendedAnnotation
): annotation is ExtendedAnnotation<TaggedLocalAnnotation> =>
  annotation.metadata[ANNOTATION_SOURCE_KEY] === AnnotationSource.LOCAL;

export const isExtendedAnnotationAnnotation = (
  annotation: ExtendedAnnotation
): annotation is ExtendedAnnotation<TaggedAnnotationAnnotation> =>
  annotation.metadata[ANNOTATION_SOURCE_KEY] === AnnotationSource.ANNOTATIONS;

export const getResourceIdFromTaggedAnnotation = (
  annotation: TaggedAnnotation
) => {
  if (
    isTaggedAnnotationAnnotation(annotation) ||
    isTaggedLocalAnnotation(annotation)
  ) {
    if (annotation.annotationType === 'diagrams.AssetLink') {
      // @ts-expect-error
      return annotation.data.assetRef.id;
    }

    if (annotation.annotationType === 'diagrams.FileLink') {
      // @ts-expect-error
      return annotation.data.fileRef.id;
    }

    return undefined;
  }
};

export const getResourceIdFromExtendedAnnotation = (
  annotation: ExtendedAnnotation
): number | undefined => {
  return getResourceIdFromTaggedAnnotation(annotation.metadata);
};

export const getFileIdFromExtendedAnnotation = (
  annotation: ExtendedAnnotation
): number | undefined => {
  if (
    isExtendedAnnotationAnnotation(annotation) ||
    isExtendedLocalAnnotation(annotation)
  ) {
    if (annotation.metadata.annotatedResourceType === 'file') {
      return annotation.metadata.annotatedResourceId;
    }
    return undefined;
  }

  return undefined;
};

export const getFileExternalIdFromExtendedAnnotation = (
  annotation: ExtendedAnnotation
): string | undefined => {
  if (
    isExtendedAnnotationAnnotation(annotation) ||
    isExtendedLocalAnnotation(annotation)
  ) {
    return undefined;
  }

  return undefined;
};

export const isApprovedTaggedAnnotation = (annotation: TaggedAnnotation) => {
  if (isTaggedAnnotationAnnotation(annotation)) {
    return annotation.status === 'approved';
  }

  return false;
};

export const isApprovedAnnotation = (annotation: ExtendedAnnotation) => {
  return isApprovedTaggedAnnotation(annotation.metadata);
};

export const isAssetAnnotation = (annotation: ExtendedAnnotation) => {
  if (
    isExtendedAnnotationAnnotation(annotation) ||
    isExtendedLocalAnnotation(annotation)
  ) {
    return annotation.metadata.annotationType === 'diagrams.AssetLink';
  }

  return false;
};

export const isTaggedAnnotationAnnotation = (
  taggedAnnotation: TaggedAnnotation
): taggedAnnotation is TaggedAnnotationAnnotation => {
  return (
    taggedAnnotation[ANNOTATION_SOURCE_KEY] === AnnotationSource.ANNOTATIONS
  );
};

export const isTaggedLocalAnnotation = (
  taggedAnnotation: TaggedAnnotation
): taggedAnnotation is TaggedLocalAnnotation => {
  return taggedAnnotation[ANNOTATION_SOURCE_KEY] === AnnotationSource.LOCAL;
};
