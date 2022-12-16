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

  return { items: items as unknown as T[], ...relationshipParams };
};
