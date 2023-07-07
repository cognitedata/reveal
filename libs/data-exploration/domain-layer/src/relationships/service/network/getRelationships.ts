import {
  CogniteClient,
  CogniteExternalId,
  Relationship,
  RelationshipResourceType,
} from '@cognite/sdk';

import { getSourceRelationships } from './getSourceRelationships';
import { getTargetRelationships } from './getTargetRelationships';

type Payload = {
  resourceExternalIds: CogniteExternalId[];
  relationshipResourceTypes?: RelationshipResourceType[];
};

export const getRelationships = async (
  sdk: CogniteClient,
  payload: Payload
): Promise<Relationship[]> => {
  const { resourceExternalIds, relationshipResourceTypes } = payload;

  const sourceRelationships = await getSourceRelationships(sdk, {
    targetExternalIds: resourceExternalIds,
    sourceTypes: relationshipResourceTypes,
  });

  const targetRelationships = await getTargetRelationships(sdk, {
    sourceExternalIds: resourceExternalIds,
    targetTypes: relationshipResourceTypes,
  });

  return [...sourceRelationships, ...targetRelationships];
};
