import { ResourceType } from '@data-exploration-lib/core';

import { BaseResourceProps } from '../types';

import { useAnnotationsCount } from './useAnnotationsCount';
import { useDirectlyLinkedResourcesCount } from './useDirectlyLinkedResourcesCount';
import { useLinkedResourcesCount } from './useLinkedResourcesCount';
import { useNonLinkedRelatedResourcesCount } from './useNonLinkedRelatedResourcesCount';
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
  const annotations = useAnnotationsCount({ resource, resourceType });

  const linkedResources = useLinkedResourcesCount({
    resource,
    resourceType,
    isDocumentsApiEnabled,
  });

  const directlyLinkedResources = useDirectlyLinkedResourcesCount({
    resource,
    resourceType,
    isDocumentsApiEnabled,
  });

  const relationships = useRelationshipsCount({
    resource,
    resourceType,
    isDocumentsApiEnabled,
  });

  const nonLinkedRelatedResources = useNonLinkedRelatedResourcesCount({
    resource,
    resourceType,
    isDocumentsApiEnabled,
  });

  const count =
    annotations.data +
    directlyLinkedResources.data +
    linkedResources.data +
    relationships.data -
    nonLinkedRelatedResources.data;

  const isLoading =
    annotations.isLoading ||
    directlyLinkedResources.isLoading ||
    linkedResources.isLoading ||
    relationships.isLoading ||
    nonLinkedRelatedResources.isLoading;

  return { data: count, isLoading };
};
