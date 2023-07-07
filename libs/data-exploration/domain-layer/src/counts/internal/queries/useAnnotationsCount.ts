import { ResourceType } from '@data-exploration-lib/core';

import { useFileAnnotationsQuery } from '../../../annotations';
import { BaseResourceProps } from '../types';
import { getResourceId } from '../utils';

export const useAnnotationsCount = ({
  resource,
  resourceType,
}: {
  resource?: BaseResourceProps;
  resourceType: ResourceType;
}) => {
  const resourceId = getResourceId(resource);

  const { data = [], isLoading } = useFileAnnotationsQuery(
    resourceId,
    resourceType === 'file'
  );

  const count = data.length;

  return { data: count, isLoading };
};
