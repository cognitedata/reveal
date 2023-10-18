import { IdEither } from '@cognite/sdk';

import { ResourceType } from '@data-exploration-lib/core';

import { useAssetIdsQuery, useLinkedResourcesCountQuery } from '../../service';
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
  const { data: assetIds = [] } = useAssetIdsQuery({
    resourceType: convertToSdkResourceType(resource.type),
    resourceId:
      resourceType !== 'file' ? getResourceId(resource) : { id: resource?.id },
    isDocumentsApiEnabled,
  });

  const { data = 0, isInitialLoading } = useLinkedResourcesCountQuery({
    resourceType: convertToSdkResourceType(resourceType),
    assetIds,
    linkedResourceIds,
    isDocumentsApiEnabled,
  });

  return {
    data,
    isLoading: isInitialLoading,
  };
};
