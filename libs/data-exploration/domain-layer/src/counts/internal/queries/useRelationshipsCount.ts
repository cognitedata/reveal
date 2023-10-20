import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import { ResourceType } from '@data-exploration-lib/core';

import { useRelatedResourceExternalIds } from '../../../relationships';
import { useValidResourcesCountQuery } from '../../service';
import { BaseResourceProps } from '../types';
import { convertToSdkResourceType, extractExternalId } from '../utils';

import { useLinkedResourcesCount } from './useLinkedResourcesCount';

export const useRelationshipsCount = ({
  resource,
  resourceType,
  isDocumentsApiEnabled,
  ignoreLinkedResources = false,
}: {
  resource: BaseResourceProps;
  resourceType: ResourceType;
  isDocumentsApiEnabled: boolean;
  ignoreLinkedResources?: boolean;
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

  const linkedResources = useLinkedResourcesCount({
    resource,
    resourceType,
    isDocumentsApiEnabled,
    linkedResourceIds: relatedResourceIds,
    enabled: !isEmpty(relatedResourceIds) && ignoreLinkedResources,
  });

  const count = validCount.data || 0;
  const isLoading = relationships.isLoading || validCount.isInitialLoading;

  if (!isEmpty(relatedResourceIds) && ignoreLinkedResources) {
    return {
      data: count - linkedResources.data,
      isLoading: isLoading || linkedResources.isLoading,
    };
  }

  return {
    data: count,
    isLoading,
  };
};
