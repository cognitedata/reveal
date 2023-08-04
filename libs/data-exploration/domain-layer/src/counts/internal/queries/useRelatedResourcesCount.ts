import { ResourceType } from '@data-exploration-lib/core';

import { BaseResourceProps } from '../types';

import { useAnnotationsCount } from './useAnnotationsCount';
import { useAssetIdsCount } from './useAssetIdsCount';
import { useLinkedResourcesCount } from './useLinkedResourcesCount';
import { useRelationshipsCount } from './useRelationshipsCount';

export const useRelatedResourcesCount = ({
  resource,
  resourceType,
  isDocumentsApiEnabled = true,
}: {
  resource: BaseResourceProps;
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
  const relationships = useRelationshipsCount({
    resource,
    resourceType,
    isDocumentsApiEnabled,
  });

  const data = {
    annotationsCount: annotations.data,
    assetIdsCount: assetIds.data,
    linkedResourcesCount: linkedResources.data,
    relationshipsCount: relationships.data,
  };

  const isLoading =
    annotations.isLoading ||
    assetIds.isLoading ||
    linkedResources.isLoading ||
    relationships.isLoading;

  return { data, isLoading };
};
