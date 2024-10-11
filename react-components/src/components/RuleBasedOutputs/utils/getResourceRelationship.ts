/*!
 * Copyright 2024 Cognite AS
 */
import { type RelationshipResourceType, type CogniteClient } from '@cognite/sdk/dist/src';
import { type ExtendedRelationshipWithSourceAndTarget } from '../../../data-providers/types';
import { getRelationships } from '../../../hooks/network/getRelationships';

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
