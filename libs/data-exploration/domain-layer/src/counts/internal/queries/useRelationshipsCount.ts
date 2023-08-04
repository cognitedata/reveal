import { useMemo } from 'react';

import { ResourceType } from '@data-exploration-lib/core';

import { useRelatedResourceExternalIds } from '../../../relationships';
import { useValidResourcesCountQuery } from '../../service';
import { BaseResourceProps } from '../types';
import { convertToSdkResourceType, extractExternalId } from '../utils';

export const useRelationshipsCount = ({
  resource,
  resourceType,
  isDocumentsApiEnabled,
}: {
  resource: BaseResourceProps;
  resourceType: ResourceType;
  isDocumentsApiEnabled: boolean;
}) => {
  const relationships = useRelatedResourceExternalIds({
    resourceExternalId: extractExternalId(resource),
  });

  const relatedResourceIds = useMemo(() => {
    return relationships.data[resourceType].map((externalId) => ({
      externalId,
    }));
  }, [relationships.data, resourceType]);

  const validCount = useValidResourcesCountQuery({
    resourceType: convertToSdkResourceType(resourceType),
    resourceIds: relatedResourceIds,
    isDocumentsApiEnabled,
  });

  const count = validCount.data || 0;
  const isLoading = relationships.isLoading || validCount.isInitialLoading;

  return { data: count, isLoading };
};
