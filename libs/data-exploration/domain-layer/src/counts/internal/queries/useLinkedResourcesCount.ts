import { ResourceType } from '@data-exploration-lib/core';

import { useLinkedResourcesCountQuery } from '../../service';
import { BaseResourceProps } from '../types';
import { convertToSdkResourceType, getResourceId } from '../utils';

export const useLinkedResourcesCount = ({
  resource,
  resourceType,
  isDocumentsApiEnabled,
}: {
  resource?: BaseResourceProps;
  resourceType: ResourceType;
  isDocumentsApiEnabled: boolean;
}) => {
  const { data = 0, isLoading } = useLinkedResourcesCountQuery({
    resourceType: convertToSdkResourceType(resourceType),
    resourceId: getResourceId(resource),
    isDocumentsApiEnabled,
  });

  return { data, isLoading };
};
