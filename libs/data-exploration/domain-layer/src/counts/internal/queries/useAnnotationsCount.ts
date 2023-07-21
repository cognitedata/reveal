import { ResourceType } from '@data-exploration-lib/core';

import { useFileAnnotationsQuery } from '../../../annotations';
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
  const enabled = resourceType === 'file';

  const { data = [], isInitialLoading } = useFileAnnotationsQuery(
    resourceId,
    enabled
  );

  const count = enabled ? data.length : 0;

  return {
    data: count,
    isLoading: isInitialLoading,
  };
};
