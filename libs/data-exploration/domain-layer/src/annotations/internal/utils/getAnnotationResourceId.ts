import { get } from 'lodash';

import { AnnotationData } from '@cognite/sdk';

import { ResourceType, ResourceTypes } from '@data-exploration-lib/core';

import { AnnotationModelInternal } from '../types';

export const getAnnotationResourceId = (
  data: AnnotationData,
  resourceType?: ResourceType
): AnnotationModelInternal['resourceId'] => {
  switch (resourceType) {
    case ResourceTypes.Asset:
      return get(data, 'assetRef.id');

    case ResourceTypes.File:
      return get(data, 'fileRef.id');

    default:
      return undefined;
  }
};
