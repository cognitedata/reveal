import { ResourceType } from '@data-exploration-lib/core';

import { useLinkedResourcesCountQuery } from '../../service';
import { BaseResourceProps } from '../types';
import { convertToSdkResourceType, getResourceId } from '../utils';

export const useLinkedResourcesCount = ({
  resource,
  resourceType,
}: {
  resource?: BaseResourceProps;
  resourceType: ResourceType;
}) => {
  const { data = 0, isLoading } = useLinkedResourcesCountQuery({
    resourceType: convertToSdkResourceType(resourceType),
    resourceId: getResourceId(resource),
  });

  return { data, isLoading };
};
