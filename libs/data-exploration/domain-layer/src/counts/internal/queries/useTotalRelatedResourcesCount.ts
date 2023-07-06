import { ResourceType } from '@data-exploration-lib/core';

import { useRelatedResourceExternalIds } from '../../../relationships';
import { BaseResourceProps } from '../types';
import { extractExternalId } from '../utils';

import { useAnnotationsCount } from './useAnnotationsCount';
import { useAssetIdsCount } from './useAssetIdsCount';
import { useLinkedResourcesCount } from './useLinkedResourcesCount';
import { useRelationshipsCount } from './useRelationshipsCount';

export const useTotalRelatedResourcesCount = ({
  resource,
  resourceType,
}: {
  resource?: BaseResourceProps;
  resourceType: ResourceType;
}) => {
  const relatedResourceExternalIds = useRelatedResourceExternalIds(
    extractExternalId(resource)
  );

  const annotations = useAnnotationsCount({ resource, resourceType });
  const assetIds = useAssetIdsCount({ resource, resourceType });
  const linkedResources = useLinkedResourcesCount({ resource, resourceType });
  const relationships = useRelationshipsCount({ resource, resourceType });

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
