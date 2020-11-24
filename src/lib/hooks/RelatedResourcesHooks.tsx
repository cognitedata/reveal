import { useInfiniteRelationshipsList } from 'lib/hooks/RelationshipHooks';
import { ResourceType, ResourceItem } from 'lib/types';
import { Resource } from 'lib';

export type RelatedResourceType =
  | 'linkedResource'
  | 'relationship'
  | 'annotation';

export const useRelatedResourceResults = <T extends Resource>(
  relatedResourceType: RelatedResourceType,
  type: ResourceType,
  parentResource: ResourceItem
) => {
  const { items = [], ...relationshipParams } = useInfiniteRelationshipsList(
    parentResource.externalId,
    type,
    relatedResourceType === 'relationship'
  );

  return { items: items as T[], ...relationshipParams };
};
