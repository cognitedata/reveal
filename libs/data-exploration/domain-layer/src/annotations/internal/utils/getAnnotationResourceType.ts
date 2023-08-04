import { ResourceTypes } from '@data-exploration-lib/core';

import { AnnotationType } from '../../service/types';
import { AnnotationModelInternal } from '../types';

export const getAnnotationResourceType = (
  annotationType: AnnotationType
): AnnotationModelInternal['resourceType'] => {
  switch (annotationType) {
    case 'diagrams.AssetLink':
    case 'images.AssetLink':
      return ResourceTypes.Asset;

    case 'diagrams.FileLink':
      return ResourceTypes.File;

    default:
      return undefined;
  }
};
