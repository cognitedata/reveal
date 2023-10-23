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
  const assetIdsQuery = useAssetIdsQuery({
    resourceType: convertToSdkResourceType(resource.type),
    resourceId: getResourceId(resource),
    isDocumentsApiEnabled,
    enabled: resource.type === 'asset' || resourceType === 'asset',
  });

  const directResourcesQuery = useDirectlyLinkedResourcesCountQuery({
    resourceType: convertToSdkResourceType(resourceType),
    assetIds: assetIdsQuery.data,
    isDocumentsApiEnabled,
    enabled: resource.type === 'asset',
  });

  if (resource.type === 'asset') {
    return {
      data: directResourcesQuery.data || 0,
      isLoading: directResourcesQuery.isInitialLoading,
    };
  }

  return {
    data: assetIdsQuery.data?.length || 0,
    isLoading: assetIdsQuery.isInitialLoading,
  };
};
