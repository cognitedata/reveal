import { ResourceType } from '@data-exploration-lib/core';

import { useAssetIdsCountQuery } from '../../service';
import { BaseResourceProps } from '../types';
import { convertToSdkResourceType, getResourceId } from '../utils';

export const useAssetIdsCount = ({
  resource,
  resourceType,
}: {
  resource?: BaseResourceProps;
  resourceType: ResourceType;
}) => {
  const { data = 0, isLoading } = useAssetIdsCountQuery({
    resourceType: convertToSdkResourceType(resourceType),
    resourceId: getResourceId(resource),
  });

  return { data, isLoading };
};
