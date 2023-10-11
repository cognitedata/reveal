import isUndefined from 'lodash/isUndefined';
import uniq from 'lodash/uniq';

import { AnnotationModel, CogniteInternalId } from '@cognite/sdk';

import { ResourceType, ResourceTypes } from '@data-exploration-lib/core';

import { transformToAnnotationModelInternal } from './transformToAnnotationModelInternal';

export const transformToAnnotationsResourceIds = (data: AnnotationModel[]) => {
  const result: Record<ResourceType, CogniteInternalId[]> = {
    [ResourceTypes.Asset]: [],
    [ResourceTypes.Event]: [],
    [ResourceTypes.TimeSeries]: [],
    [ResourceTypes.Sequence]: [],
    [ResourceTypes.File]: [],
    [ResourceTypes.ThreeD]: [],
    [ResourceTypes.Charts]: [],
  };

  const annotations = transformToAnnotationModelInternal(data);

  annotations.forEach(({ resourceType, resourceId }) => {
    if (resourceType && !isUndefined(resourceId)) {
      result[resourceType].push(resourceId);
    }
  });

  return Object.entries(result).reduce((acc, [type, ids]) => {
    return {
      ...acc,
      [type]: uniq(ids),
    };
  }, {} as typeof result);
};
