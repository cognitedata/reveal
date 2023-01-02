import {
  useInfiniteRelationshipsList,
  Resource,
} from '@data-exploration-components/hooks/RelationshipHooks';
import { ResourceType, ResourceItem } from '@data-exploration-components/types';

export type RelatedResourceType =
  | 'linkedResource'
  | 'relationship'
  | 'annotation'
  | 'assetId'
  | 'annotatedWith';

export const useRelatedResourceResults = <T,>(
  relatedResourceType: RelatedResourceType,
  type: ResourceType,
  parentResource: ResourceItem,
  limit?: number
) => {
  const { items = [], ...relationshipParams } = useInfiniteRelationshipsList(
    parentResource.externalId,
    type,
    relatedResourceType === 'relationship',
    limit
  );

  return { items: items as unknown as T[], ...relationshipParams };
};
