import { ResourceType } from '@data-exploration-lib/core';

import {
  useAssetIdsQuery,
  useDirectlyLinkedResourcesCountQuery,
} from '../../service';
import { BaseResourceProps } from '../types';
import { convertToSdkResourceType, getResourceId } from '../utils';

export const useDirectlyLinkedResourcesCount = ({
  resource,
  resourceType,
  isDocumentsApiEnabled,
}: {
  resource: BaseResourceProps;
  resourceType: ResourceType;
  isDocumentsApiEnabled: boolean;
}) => {
  const { data: assetIds = [] } = useAssetIdsQuery({
    resourceType: convertToSdkResourceType(resource.type),
    resourceId: getResourceId(resource),
    isDocumentsApiEnabled,
  });

  const { data = 0, isInitialLoading } = useDirectlyLinkedResourcesCountQuery({
    resourceType: convertToSdkResourceType(resourceType),
    assetIds,
    isDocumentsApiEnabled,
  });

  return {
    data,
    isLoading: isInitialLoading,
  };
};
