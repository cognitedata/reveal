import { ResourceType } from '@data-exploration-lib/core';

import { useRelatedResourceExternalIds } from '../../../relationships';
import { BaseResourceProps } from '../types';
import { extractExternalId, getResourceId } from '../utils';

export const useRelationshipsCount = ({
  resource,
  resourceType,
}: {
  resource?: BaseResourceProps;
  resourceType: ResourceType;
}) => {
  const resourceId = getResourceId(resource);
  const resourceExternalId = extractExternalId(resourceId);

  const { data, isLoading } = useRelatedResourceExternalIds(resourceExternalId);

  const count = data[resourceType].length;

  return { data: count, isLoading };
};
