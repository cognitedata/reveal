import { ResourceType } from '@data-exploration-lib/core';

import { useFileAnnotationsResourceIds } from '../../../annotations';
import { BaseResourceProps } from '../types';
import { getResourceId } from '../utils';

export const useAnnotationsCount = ({
  resource,
  resourceType,
}: {
  resource: BaseResourceProps;
  resourceType: ResourceType;
}) => {
  const resourceId = getResourceId(resource);
  const enabled = resource.type === 'file';

  const { data, isInitialLoading } = useFileAnnotationsResourceIds(
    resourceId,
    enabled
  );

  const count = enabled ? data[resourceType].length : 0;

  return {
    data: count,
    isLoading: isInitialLoading,
  };
};
