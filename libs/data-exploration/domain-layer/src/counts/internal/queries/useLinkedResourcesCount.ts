import { IdEither } from '@cognite/sdk';

import { ResourceType } from '@data-exploration-lib/core';

import { useLinkedResourcesCountQuery } from '../../service';
import { BaseResourceProps } from '../types';
import { convertToSdkResourceType, getResourceId } from '../utils';

export const useLinkedResourcesCount = ({
  resource,
  resourceType,
  linkedResourceIds,
  isDocumentsApiEnabled,
}: {
  resource: BaseResourceProps;
  resourceType: ResourceType;
  linkedResourceIds?: IdEither[];
  isDocumentsApiEnabled: boolean;
}) => {
  const { data = 0, isLoading } = useLinkedResourcesCountQuery({
    resourceType: convertToSdkResourceType(resourceType),
    resourceId:
      resourceType !== 'file' ? getResourceId(resource) : { id: resource?.id },
    linkedResourceIds,
    isDocumentsApiEnabled,
  });

  return { data, isLoading };
};
