import { ResourceType } from '@data-exploration-lib/core';

import { useRelatedResourceExternalIds } from '../../../relationships';
import { BaseResourceProps } from '../types';
import { extractExternalId } from '../utils';

export const useRelationshipsCount = ({
  resource,
  resourceType,
}: {
  resource?: BaseResourceProps;
  resourceType: ResourceType;
}) => {
  const { data, isLoading } = useRelatedResourceExternalIds({
    resourceExternalId: extractExternalId(resource),
  });

  const count = data[resourceType].length;

  return { data: count, isLoading };
};
