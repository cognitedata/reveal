import { ResourceType } from '@data-exploration-lib/core';

import { useAssetIdsQuery } from '../../service';
import { BaseResourceProps } from '../types';
import { convertToSdkResourceType, getResourceId } from '../utils';

export const useAssetIdsCount = ({
  resource,
  resourceType,
  isDocumentsApiEnabled,
}: {
  resource?: BaseResourceProps;
  resourceType: ResourceType;
  isDocumentsApiEnabled: boolean;
}) => {
  const { data = [], isLoading } = useAssetIdsQuery({
    resourceType: convertToSdkResourceType(resourceType),
    resourceId: getResourceId(resource),
    isDocumentsApiEnabled,
  });

  const count = data.length;

  return { data: count, isLoading };
};
