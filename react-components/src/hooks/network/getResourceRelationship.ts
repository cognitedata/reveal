import { type RelationshipResourceType, type CogniteClient } from '@cognite/sdk';
import { type ExtendedRelationshipWithSourceAndTarget } from '../../data-providers/types';
import { getRelationships } from './getRelationships';

export const getResourceRelationship = async (
  sdk: CogniteClient,
  resourceIds: string[],
  resourceTypes: RelationshipResourceType[]
): Promise<ExtendedRelationshipWithSourceAndTarget[]> => {
  if (resourceIds.length === 0 || resourceIds.filter((id) => id.length > 0).length === 0) {
    return [];
  }
  return await getRelationships(sdk, {
    resourceExternalIds: resourceIds,
    relationshipResourceTypes: resourceTypes
  });
};
