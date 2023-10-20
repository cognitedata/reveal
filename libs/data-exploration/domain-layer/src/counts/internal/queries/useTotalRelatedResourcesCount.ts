import { ResourceType } from '@data-exploration-lib/core';

import { BaseResourceProps } from '../types';

import { useAnnotationsCount } from './useAnnotationsCount';
import { useLinkedResourcesCount } from './useLinkedResourcesCount';
import { useRelationshipsCount } from './useRelationshipsCount';

export const useTotalRelatedResourcesCount = ({
  resource,
  resourceType,
  isDocumentsApiEnabled = true,
}: {
  resource: BaseResourceProps;
  resourceType: ResourceType;
  isDocumentsApiEnabled?: boolean;
}) => {
  const annotations = useAnnotationsCount({
    resource,
    resourceType,
    isDocumentsApiEnabled,
    ignoreLinkedResources: true,
  });

  const linkedResources = useLinkedResourcesCount({
    resource,
    resourceType,
    isDocumentsApiEnabled,
  });

  const relationships = useRelationshipsCount({
    resource,
    resourceType,
    isDocumentsApiEnabled,
    ignoreLinkedResources: true,
  });

  const count = annotations.data + linkedResources.data + relationships.data;

  const isLoading =
    annotations.isLoading ||
    linkedResources.isLoading ||
    relationships.isLoading;

  return { data: count, isLoading };
};
