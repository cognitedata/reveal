import { ResourceType, ResourceTypes } from '@data-exploration-lib/core';

import { useFileAnnotationsQuery } from '../../../annotations';
import { BaseResource, Counts } from '../types';
import { getResourceId } from '../utils';

export const useAnnotationsCounts = (
  resource: BaseResource | undefined,
  resourceType: ResourceType
) => {
  const resourceId = getResourceId(resource);

  const { data = [], isLoading } = useFileAnnotationsQuery(
    resourceId,
    resourceType === 'file'
  );

  const counts: Counts = {
    [ResourceTypes.Asset]: 0,
    [ResourceTypes.Event]: 0,
    [ResourceTypes.TimeSeries]: 0,
    [ResourceTypes.Sequence]: 0,
    [ResourceTypes.File]: data.length,
  };

  return { data: counts, isLoading };
};
