import { AnnotationModel } from '@cognite/sdk';
import {
  AnnotationType as UfvAnnotationType,
  getDefaultStylesByResourceType,
} from '@cognite/unified-file-viewer';

import {
  ExtendedAnnotation,
  TaggedAnnotationAnnotation,
} from '@data-exploration-lib/core';

import { getTaggedAnnotationAnnotation } from '../migration/utils';

import {
  getAnnotationId,
  getBoundingBoxFromAnnotationData,
  getRefResourceType,
} from './utils';

const getRectangleAnnotationFromCogniteAnnotation = (
  annotation: AnnotationModel,
  containerId: string
): ExtendedAnnotation<TaggedAnnotationAnnotation> => {
  const { xMin, yMin, xMax, yMax } = getBoundingBoxFromAnnotationData(
    annotation.data
  );
  return {
    id: getAnnotationId(containerId, annotation),
    containerId: containerId,
    type: UfvAnnotationType.RECTANGLE,
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin,
    style: getDefaultStylesByResourceType(getRefResourceType(annotation.data)),
    metadata: getTaggedAnnotationAnnotation(annotation),
  };
};

const filterApplicableAnnotations = (annotation: AnnotationModel) => {
  const supportedAnnotatedResourceTypes = ['file'];
  const supportedAnnotationTypes = [
    'diagrams.AssetLink',
    'diagrams.FileLink',
    'diagrams.UnhandledTextObject',
  ];
  return (
    supportedAnnotatedResourceTypes.includes(
      annotation.annotatedResourceType
    ) && supportedAnnotationTypes.includes(annotation.annotationType)
  );
};

const getExtendedAnnotationsFromAnnotationsApi = (
  annotations: AnnotationModel[],
  containerId: string
): ExtendedAnnotation[] =>
  annotations
    .filter(filterApplicableAnnotations)
    .map((annotation) =>
      getRectangleAnnotationFromCogniteAnnotation(annotation, containerId)
    );

export default getExtendedAnnotationsFromAnnotationsApi;
