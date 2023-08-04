import {
  CogniteClient,
  CogniteExternalId,
  RelationshipResourceType,
  RelationshipsFilter,
} from '@cognite/sdk';

import { ExtendedRelationship } from '../types';

import { getSourceRelationships } from './getSourceRelationships';
import { getTargetRelationships } from './getTargetRelationships';

interface Payload
  extends Omit<
    RelationshipsFilter,
    'sourceExternalIds' | 'targetExternalIds' | 'sourceTypes' | 'targetTypes'
  > {
  resourceExternalIds: CogniteExternalId[];
  relationshipResourceTypes?: RelationshipResourceType[];
}

export const getRelationships = async (
  sdk: CogniteClient,
  payload: Payload
): Promise<ExtendedRelationship[]> => {
  const { resourceExternalIds, relationshipResourceTypes, ...rest } = payload;

  const sourceRelationships = await getSourceRelationships(sdk, {
    targetExternalIds: resourceExternalIds,
    sourceTypes: relationshipResourceTypes,
    ...rest,
  });

  const targetRelationships = await getTargetRelationships(sdk, {
    sourceExternalIds: resourceExternalIds,
    targetTypes: relationshipResourceTypes,
    ...rest,
  });

  return [...sourceRelationships, ...targetRelationships];
};
