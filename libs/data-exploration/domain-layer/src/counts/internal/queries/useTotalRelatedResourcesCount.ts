import { ResourceType } from '@data-exploration-lib/core';

import { BaseResourceProps } from '../types';

import { useAnnotationsCount } from './useAnnotationsCount';
import { useAssetIdsCount } from './useAssetIdsCount';
import { useLinkedResourcesCount } from './useLinkedResourcesCount';
import { useNonLinkedRelatedResourcesCount } from './useNonLinkedRelatedResourcesCount';
import { useRelationshipsCount } from './useRelationshipsCount';

export const useTotalRelatedResourcesCount = ({
  resource,
  resourceType,
  isDocumentsApiEnabled = true,
}: {
  resource?: BaseResourceProps;
  resourceType: ResourceType;
  isDocumentsApiEnabled?: boolean;
}) => {
  const annotations = useAnnotationsCount({ resource, resourceType });
  const assetIds = useAssetIdsCount({
    resource,
    resourceType,
    isDocumentsApiEnabled,
  });
  const linkedResources = useLinkedResourcesCount({
    resource,
    resourceType,
    isDocumentsApiEnabled,
  });
  const relationships = useRelationshipsCount({ resource, resourceType });
  const nonLinkedRelatedResources = useNonLinkedRelatedResourcesCount({
    resource,
    resourceType,
    isDocumentsApiEnabled,
  });

  const count =
    annotations.data +
    assetIds.data +
    linkedResources.data +
    relationships.data -
    nonLinkedRelatedResources.data;

  const isLoading =
    annotations.isLoading ||
    assetIds.isLoading ||
    linkedResources.isLoading ||
    relationships.isLoading ||
    nonLinkedRelatedResources.isLoading;

  return { data: count, isLoading };
};
