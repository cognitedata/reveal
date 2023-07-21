import { ResourceType, ResourceTypes } from '@data-exploration-lib/core';

import { useAssetIdsQuery } from '../../service';
import { BaseResourceProps } from '../types';
import { convertToSdkResourceType, getResourceId } from '../utils';

export const useAssetIdsCount = ({
  resource,
  resourceType,
  isDocumentsApiEnabled,
}: {
  resource: BaseResourceProps;
  resourceType: ResourceType;
  isDocumentsApiEnabled: boolean;
}) => {
  const { data = [], isInitialLoading } = useAssetIdsQuery({
    /**
     * We should fetch the actual item.
     * Hence, we should pass the arent resource type as resourceType.
     */
    resourceType: convertToSdkResourceType(resource.type),
    resourceId: getResourceId(resource),
    isDocumentsApiEnabled,
    enabled: resourceType === ResourceTypes.Asset,
  });

  /**
   * Asset ID's count is relevant only to Assets.
   * Hence, the count should be considered only when the required resource type is Asset.
   */
  const count = resourceType === ResourceTypes.Asset ? data.length : 0;

  return {
    data: count,
    isLoading: isInitialLoading,
  };
};
