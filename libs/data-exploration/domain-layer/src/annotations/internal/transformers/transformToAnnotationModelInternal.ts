import { AnnotationModel } from '@cognite/sdk';

import { AnnotationType } from '../../service/types';
import { AnnotationModelInternal } from '../types';
import { getAnnotationResourceId, getAnnotationResourceType } from '../utils';

export const transformToAnnotationModelInternal = (
  annotations: AnnotationModel[]
): AnnotationModelInternal[] => {
  return annotations.map((annotation) => {
    const { annotationType, data } = annotation;

    const resourceType = getAnnotationResourceType(
      annotationType as AnnotationType
    );

    return {
      ...annotation,
      resourceType,
      resourceId: getAnnotationResourceId(data, resourceType),
    };
  });
};
